"""Core Driver Monitoring System (DMS) Integrated Pipeline Engine.

Fuses:
1. Video Ingestion & 1080p 30 FPS Stream
2. Optical Blindness & Lens Occlusion Check
3. Dynamic Driver-Centered ROI Face Cropping
4. YOLO11n Behavior Cue Detection
5. Eye Aspect Ratio (EAR) & 60s Valid-Time PERCLOS
6. Continuous-Time Exponential Moving Average (EMA) Filtering
7. Mirror-Check Glances & Cooldown Suppression
8. Tiered Multi-Modal Audio & Flashing LED Bar Alerts
9. Power-Cut-Safe SQLite WAL Event Logging
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
import cv2
import numpy as np

from dms.camera import CameraFeed, FrameData
from dms.blindness import CameraBlindCheck, BlindnessResult
from dms.roi import DriverRoiTracker, RoiCrop
from dms.detector import DriverBehaviorDetector, Detection
from dms.eye_tracker import EyeTracker, EyeTrackingResult
from dms.temporal_filter import TemporalFilter
from dms.suppression import SuppressionEngine, AlertDecision
from dms.alerts import AlertManager
from dms.calibration import DriverCalibrationSession, CalibrationProfile
from dms.database import DmsDatabaseLogger
from dms.rest_stops import RestStopRecommender, RestStopPOI


@dataclass
class EngineTelemetry:
    timestamp: float
    fps: float
    state: str  # 'NORMAL', 'ATTENTION', 'WARNING', 'CRITICAL', 'CAMERA_BLOCKED'
    led_status: str
    drowsiness_risk: float
    distraction_risk: float
    ear: float
    perclos: Optional[float]
    perclos_coverage: float
    head_yaw_deg: float
    head_pitch_deg: float
    active_cues: List[str]
    blindness_reason: str
    trip_id: str
    calibration_progress: float
    alert_triggered: bool
    recent_alert_message: str


class DmsEngine:
    """Central processing engine for real-time edge driver monitoring."""

    def __init__(
        self,
        camera_source: int | str = 0,
        audio_enabled: bool = True,
        language: str = "en",
        db_path: Optional[str] = None,
    ):
        self.camera = CameraFeed(source=camera_source)
        self.blind_check = CameraBlindCheck()
        self.roi_tracker = DriverRoiTracker()
        self.detector = DriverBehaviorDetector()
        self.eye_tracker = EyeTracker()
        self.temporal_filter = TemporalFilter(time_constant_sec=0.8)
        self.suppression = SuppressionEngine()
        self.alert_manager = AlertManager(audio_enabled=audio_enabled, language=language)
        self.db = DmsDatabaseLogger(db_path=db_path)
        self.calibration = DriverCalibrationSession()

        self.trip_id = f"trip_{int(time.time())}"
        self.is_running = False
        self.recent_alert_message = ""
        self._last_annotated_frame: Optional[np.ndarray] = None
        self._last_telemetry: Optional[EngineTelemetry] = None

    def start(self):
        """Starts video capture and begins a new trip log."""
        self.camera.open()
        self.db.start_trip(self.trip_id)
        self.is_running = True
        print(f"[DmsEngine] Started trip session: {self.trip_id}")

    def stop(self):
        """Stops video capture and finalizes trip log."""
        self.is_running = False
        self.camera.release()
        self.db.end_trip(self.trip_id)
        print(f"[DmsEngine] Finalized trip session: {self.trip_id}")

    def step(self) -> Tuple[Optional[np.ndarray], EngineTelemetry]:
        """Processes one video frame and returns (annotated_frame, telemetry)."""
        frame_data = self.camera.read()
        if frame_data is None:
            # Return cached or blank telemetry if camera read fails
            return None, self._make_telemetry(time.monotonic(), 0.0, "UNKNOWN", 0.0, 0.0, 0.0, None, 0.0, 0.0, 0.0, [], "NO_FRAME", False, "")

        frame = frame_data.frame
        ts = frame_data.timestamp
        fps = frame_data.fps

        # 1. Camera-blind check
        blind_res = self.blind_check.evaluate(frame, ts)
        if blind_res.is_blocked:
            self.alert_manager.trigger(2, "distraction_chime.wav", "Camera blocked or obscured!", "الكاميرا محجوبة!")
            annotated = self._draw_overlay(frame, [], None, None, "CAMERA_BLOCKED", blind_res.reason, fps, 0.0, 0.0, 0.0)
            telem = self._make_telemetry(ts, fps, "CAMERA_BLOCKED", 0.0, 0.0, 0.0, None, 0.0, 0.0, 0.0, [], blind_res.reason, True, "Camera Blocked")
            self._last_annotated_frame = annotated
            self._last_telemetry = telem
            return annotated, telem

        # 2. Dynamic driver ROI crop tracking
        roi = self.roi_tracker.process(frame)

        # 3. Behavior detection on ROI crop
        detections = self.detector.detect(roi.cropped_frame, roi_offset=(roi.x, roi.y))

        # 4. Eye tracking, EAR, and PERCLOS
        eye_res = self.eye_tracker.process(roi.cropped_frame, ts)

        # 5. Mirror-check suppression
        is_turned_distracted, mirror_status = self.suppression.evaluate_head_turn(eye_res.head_yaw_deg, ts)
        if is_turned_distracted:
            detections.append(
                Detection(
                    class_id=4,
                    class_name="Looking away",
                    category="distraction",
                    confidence=0.85,
                    bbox=None,
                )
            )

        # Micro-sleep prolonged closure cue
        if eye_res.is_prolonged_closure:
            detections.append(
                Detection(
                    class_id=5,
                    class_name="Micro-sleep / closed eyes",
                    category="drowsiness",
                    confidence=0.95,
                    bbox=None,
                )
            )

        # 6. Temporal EMA filtering of class scores
        raw_drowsy_score = max([d.confidence for d in detections if d.category == "drowsiness"], default=0.0)
        raw_distract_score = max([d.confidence for d in detections if d.category == "distraction"], default=0.0)

        filt_drowsy = self.temporal_filter.update("drowsiness", raw_drowsy_score, ts)
        filt_distract = self.temporal_filter.update("distraction", raw_distract_score, ts)

        # 7. Update calibration if in progress
        calib_prog = 0.0
        if self.calibration._is_active:
            calib_prog = self.calibration.update(eye_res.avg_ear, max(raw_drowsy_score, raw_distract_score), ts)
            if self.calibration.is_finished(ts):
                prof = self.calibration.finish()
                self.eye_tracker.calibrate(prof.baseline_ear_open, prof.baseline_ear_closed)
                self.db.log_calibration(prof.driver_id, prof.baseline_ear_open, prof.baseline_ear_closed, prof.suggested_conf_cutoff)
                print(f"[DmsEngine] Calibration completed: Open EAR={prof.baseline_ear_open}, Cutoff={prof.suggested_conf_cutoff}")

        # 8. Check alerts & suppression
        alert_decision = None
        critical = eye_res.is_prolonged_closure or (eye_res.perclos_60s is not None and eye_res.perclos_60s > 0.35)

        if filt_drowsy > filt_distract:
            alert_decision = self.suppression.check_alert("drowsiness", filt_drowsy, ts, critical_condition=critical)
        elif filt_distract > 0:
            alert_decision = self.suppression.check_alert("distraction", filt_distract, ts, critical_condition=False)

        alert_fired = False
        msg = ""
        current_state = "NORMAL"

        if alert_decision and alert_decision.should_alert:
            self.alert_manager.trigger(
                tier=alert_decision.alert_tier,
                sound_filename=alert_decision.sound_file,
                message_en=alert_decision.message_en,
                message_ar=alert_decision.message_ar,
            )
            alert_fired = True
            msg = alert_decision.message_en
            self.recent_alert_message = msg

            # Log confirmed event to SQLite
            active_name = "Distraction" if "distract" in alert_decision.event_type else "Drowsiness"
            self.db.log_detection(
                trip_id=self.trip_id,
                category="distraction" if "distract" in alert_decision.event_type else "drowsiness",
                class_name=active_name,
                confidence=max(filt_drowsy, filt_distract),
                duration_sec=3,
                severity="critical" if alert_decision.alert_tier >= 3 else ("warning" if alert_decision.alert_tier == 2 else "medium"),
                details=msg,
            )

        # Derive state
        if critical or filt_drowsy >= 0.80:
            current_state = "CRITICAL"
        elif filt_drowsy >= 0.60 or filt_distract >= 0.65:
            current_state = "WARNING"
        elif filt_drowsy >= 0.40 or filt_distract >= 0.45:
            current_state = "ATTENTION"
        else:
            current_state = "NORMAL"
            self.alert_manager.clear()

        # 9. Annotate HUD overlay
        active_cues = [d.class_name for d in detections]
        annotated = self._draw_overlay(
            frame=frame,
            detections=detections,
            roi=roi,
            eye_res=eye_res,
            state=current_state,
            mirror_status=mirror_status,
            fps=fps,
            drowsy_risk=filt_drowsy,
            distract_risk=filt_distract,
            calib_prog=calib_prog,
        )

        telem = self._make_telemetry(
            ts=ts,
            fps=fps,
            state=current_state,
            drowsy=filt_drowsy,
            distract=filt_distract,
            ear=eye_res.avg_ear,
            perclos=eye_res.perclos_60s,
            perclos_cov=eye_res.perclos_coverage,
            yaw=eye_res.head_yaw_deg,
            pitch=eye_res.head_pitch_deg,
            cues=active_cues,
            blind_reason=blind_res.reason,
            alert_triggered=alert_fired,
            msg=msg,
            calib_prog=calib_prog,
        )

        self._last_annotated_frame = annotated
        self._last_telemetry = telem
        return annotated, telem

    def _draw_overlay(
        self,
        frame: np.ndarray,
        detections: List[Detection],
        roi: Optional[RoiCrop],
        eye_res: Optional[EyeTrackingResult],
        state: str,
        mirror_status: str,
        fps: float,
        drowsy_risk: float,
        distract_risk: float,
        calib_prog: float,
    ) -> np.ndarray:
        """Draws informative, professional HUD graphics on frame."""
        out = frame.copy()
        h, w = out.shape[:2]

        # Top simulated LED Alert Bar
        led_color = (40, 200, 60)  # Green = Normal
        if state == "CRITICAL" or state == "CAMERA_BLOCKED":
            led_color = (30, 30, 240)  # Red = Critical
        elif state == "WARNING":
            led_color = (0, 140, 255)  # Orange = Warning
        elif state == "ATTENTION":
            led_color = (0, 220, 255)  # Yellow = Attention

        cv2.rectangle(out, (0, 0), (w, 14), led_color, -1)

        # Draw ROI bounding box if available
        if roi:
            cv2.rectangle(out, (roi.x, roi.y), (roi.x + roi.width, roi.y + roi.height), (220, 180, 50), 2)
            cv2.putText(out, "DRIVER ROI", (roi.x + 8, roi.y + 24), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (220, 180, 50), 1)

        # Draw detected violations bounding boxes
        for d in detections:
            if d.bbox:
                b = d.bbox
                box_color = (0, 165, 255) if d.category == "distraction" else (40, 40, 255)
                cv2.rectangle(out, (b.x1, b.y1), (b.x2, b.y2), box_color, 2)
                lbl = f"{d.class_name} ({d.confidence:.0%})"
                cv2.putText(out, lbl, (b.x1, max(20, b.y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.55, box_color, 2)

        # Telemetry HUD Card (semi-transparent dark panel)
        overlay = out.copy()
        cv2.rectangle(overlay, (16, 26), (360, 245), (15, 20, 30), -1)
        cv2.addWeighted(overlay, 0.75, out, 0.25, 0, out)

        # Text readouts
        cv2.putText(out, f"STATE: {state}", (30, 55), cv2.FONT_HERSHEY_SIMPLEX, 0.7, led_color, 2)
        cv2.putText(out, f"FPS: {fps:.1f} | Stream: 1080p 30 FPS", (30, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (200, 210, 220), 1)

        cv2.putText(out, f"Drowsiness Risk: {drowsy_risk:.0%}", (30, 108), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (100, 140, 255), 1)
        cv2.putText(out, f"Distraction Risk: {distract_risk:.0%}", (30, 132), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 200, 255), 1)

        if eye_res:
            cv2.putText(out, f"EAR: {eye_res.avg_ear:.2f} | Blinks: {eye_res.blink_count}", (30, 156), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 190, 200), 1)
            perclos_txt = f"{eye_res.perclos_60s:.1%}" if eye_res.perclos_60s is not None else "Calibrating..."
            cv2.putText(out, f"PERCLOS (60s): {perclos_txt}", (30, 180), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 190, 200), 1)
            cv2.putText(out, f"Head: {mirror_status}", (30, 204), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 190, 200), 1)

        if calib_prog > 0.0:
            cv2.putText(out, f"CALIBRATING: {calib_prog:.0%}", (30, 230), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 240, 180), 2)

        return out

    def _make_telemetry(
        self,
        ts: float,
        fps: float,
        state: str,
        drowsy: float,
        distract: float,
        ear: float,
        perclos: Optional[float],
        perclos_cov: float,
        yaw: float,
        pitch: float,
        cues: List[str],
        blind_reason: str,
        alert_triggered: bool,
        msg: str,
        calib_prog: float = 0.0,
    ) -> EngineTelemetry:
        return EngineTelemetry(
            timestamp=ts,
            fps=round(fps, 1),
            state=state,
            led_status=self.alert_manager.led_status,
            drowsiness_risk=round(drowsy, 3),
            distraction_risk=round(distract, 3),
            ear=round(ear, 3),
            perclos=round(perclos, 3) if perclos is not None else None,
            perclos_coverage=round(perclos_cov, 2),
            head_yaw_deg=round(yaw, 1),
            head_pitch_deg=round(pitch, 1),
            active_cues=cues,
            blindness_reason=blind_reason,
            trip_id=self.trip_id,
            calibration_progress=round(calib_prog, 2),
            alert_triggered=alert_triggered,
            recent_alert_message=msg or self.recent_alert_message,
        )
