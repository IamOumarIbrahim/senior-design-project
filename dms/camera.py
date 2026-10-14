"""Video Ingestion and Frame Capture Module for Driver Monitoring System (DMS).

Supports physical USB 3.0 webcam capture (1080p @ 30 FPS target), video file replay,
and a realistic synthetic driver generator for automated testing or headless environments.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Optional, Tuple
import cv2
import numpy as np


@dataclass
class FrameData:
    frame: np.ndarray
    timestamp: float
    frame_index: int
    fps: float
    is_synthetic: bool = False


class CameraFeed:
    """Manages video capture from webcams, files, or synthetic driver emulation."""

    def __init__(
        self,
        source: int | str = 0,
        target_width: int = 1280,
        target_height: int = 720,
        target_fps: int = 30,
        fallback_to_synthetic: bool = True,
    ):
        self.source = source
        self.target_width = target_width
        self.target_height = target_height
        self.target_fps = target_fps
        self.fallback_to_synthetic = fallback_to_synthetic

        self.cap: Optional[cv2.VideoCapture] = None
        self.is_synthetic = str(source).lower() == "synthetic"
        self.frame_index = 0
        self.start_time = 0.0
        self.last_frame_time = 0.0
        self.fps_rolling = 0.0

        # Synthetic generator state
        self._syn_eye_state = "open"  # 'open', 'blinking', 'closed'
        self._syn_yawn = False
        self._syn_phone = False
        self._syn_look_away = False
        self._syn_phase = 0.0

    def open(self) -> bool:
        """Opens the camera source or initializes synthetic mode."""
        if self.is_synthetic:
            self.start_time = time.monotonic()
            self.last_frame_time = self.start_time
            return True

        try:
            src_val = int(self.source) if isinstance(self.source, str) and self.source.isdigit() else self.source
            self.cap = cv2.VideoCapture(src_val, cv2.CAP_ANY)
            if self.cap.isOpened():
                self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.target_width)
                self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.target_height)
                self.cap.set(cv2.CAP_PROP_FPS, self.target_fps)
                self.start_time = time.monotonic()
                self.last_frame_time = self.start_time
                return True
        except Exception as e:
            print(f"[CameraFeed] Warning: Failed to open source '{self.source}': {e}")

        if self.fallback_to_synthetic:
            print(f"[CameraFeed] Fallback: Physical camera '{self.source}' unavailable. Initializing synthetic driver feed.")
            self.is_synthetic = True
            self.start_time = time.monotonic()
            self.last_frame_time = self.start_time
            return True

        return False

    def read(self) -> Optional[FrameData]:
        """Reads the next timestamped frame from camera or synthetic generator."""
        now = time.monotonic()
        dt = now - self.last_frame_time
        if dt > 0:
            current_fps = 1.0 / dt
            self.fps_rolling = 0.9 * self.fps_rolling + 0.1 * current_fps if self.fps_rolling > 0 else current_fps
        self.last_frame_time = now

        if self.is_synthetic:
            frame = self._generate_synthetic_frame(now)
            self.frame_index += 1
            return FrameData(
                frame=frame,
                timestamp=now,
                frame_index=self.frame_index,
                fps=self.fps_rolling,
                is_synthetic=True,
            )

        if self.cap and self.cap.isOpened():
            ret, frame = self.cap.read()
            if ret and frame is not None:
                self.frame_index += 1
                return FrameData(
                    frame=frame,
                    timestamp=now,
                    frame_index=self.frame_index,
                    fps=self.fps_rolling,
                    is_synthetic=False,
                )

        if self.fallback_to_synthetic:
            self.is_synthetic = True
            return self.read()

        return None

    def trigger_synthetic_cue(self, cue: str, duration_sec: float = 3.0):
        """Allows injecting synthetic behavioral cues (closed_eyes, yawn, phone, look_away)."""
        if cue == "closed_eyes":
            self._syn_eye_state = "closed"
        elif cue == "yawn":
            self._syn_yawn = True
        elif cue == "phone":
            self._syn_phone = True
        elif cue == "look_away":
            self._syn_look_away = True
        elif cue == "normal":
            self._syn_eye_state = "open"
            self._syn_yawn = False
            self._syn_phone = False
            self._syn_look_away = False

    def _generate_synthetic_frame(self, current_time: float) -> np.ndarray:
        """Generates a photorealistic synthetic in-cabin driver scene with head, eyes, and hands."""
        h, w = self.target_height, self.target_width
        frame = np.full((h, w, 3), 40, dtype=np.uint8)  # Cabin background

        # In-cabin car environment styling
        cv2.line(frame, (0, int(h * 0.3)), (w, int(h * 0.3)), (25, 25, 30), 4)  # Windshield line
        cv2.rectangle(frame, (0, int(h * 0.65)), (w, h), (30, 32, 38), -1)  # Steering wheel / dashboard base

        # Steering wheel arc
        cv2.ellipse(frame, (w // 2, h + 150), (320, 260), 0, 180, 360, (70, 75, 85), 24)

        # Head / Driver positioning
        head_cx = w // 2 + (80 if self._syn_look_away else 0)
        head_cy = int(h * 0.42)
        head_rx = 90
        head_ry = 120

        # Shoulders & Torso
        cv2.ellipse(frame, (head_cx, int(h * 0.85)), (220, 150), 0, 180, 360, (45, 65, 90), -1)

        # Head / Face oval
        cv2.ellipse(frame, (head_cx, head_cy), (head_rx, head_ry), 0, 0, 360, (185, 205, 230), -1)
        cv2.ellipse(frame, (head_cx, head_cy), (head_rx, head_ry), 0, 0, 360, (140, 160, 190), 2)

        # Eyes
        eye_y = head_cy - 15
        left_eye_x = head_cx - 36
        right_eye_x = head_cx + 36

        # Eye blink cycle (every 3.5s normal blink)
        time_in_cycle = current_time % 3.5
        is_blink = time_in_cycle < 0.2
        eye_closed = self._syn_eye_state == "closed" or is_blink

        if eye_closed:
            # Closed eye slit
            cv2.line(frame, (left_eye_x - 14, eye_y), (left_eye_x + 14, eye_y), (60, 50, 45), 3)
            cv2.line(frame, (right_eye_x - 14, eye_y), (right_eye_x + 14, eye_y), (60, 50, 45), 3)
        else:
            # Open eyes
            cv2.ellipse(frame, (left_eye_x, eye_y), (14, 8), 0, 0, 360, (255, 255, 255), -1)
            cv2.ellipse(frame, (right_eye_x, eye_y), (14, 8), 0, 0, 360, (255, 255, 255), -1)
            # Pupils (gaze)
            pupil_offset = 5 if self._syn_look_away else 0
            cv2.circle(frame, (left_eye_x + pupil_offset, eye_y), 4, (45, 30, 20), -1)
            cv2.circle(frame, (right_eye_x + pupil_offset, eye_y), 4, (45, 30, 20), -1)

        # Eyebrows
        cv2.line(frame, (left_eye_x - 16, eye_y - 14), (left_eye_x + 16, eye_y - 12), (60, 50, 40), 3)
        cv2.line(frame, (right_eye_x - 16, eye_y - 12), (right_eye_x + 16, eye_y - 14), (60, 50, 40), 3)

        # Nose
        cv2.line(frame, (head_cx, eye_y + 10), (head_cx - 4, eye_y + 35), (140, 155, 175), 2)
        cv2.line(frame, (head_cx - 4, eye_y + 35), (head_cx + 4, eye_y + 35), (140, 155, 175), 2)

        # Mouth
        mouth_y = head_cy + 60
        if self._syn_yawn:
            # Large yawning mouth
            cv2.ellipse(frame, (head_cx, mouth_y), (18, 26), 0, 0, 360, (60, 20, 25), -1)
            cv2.ellipse(frame, (head_cx, mouth_y), (18, 26), 0, 0, 360, (110, 40, 50), 2)
        else:
            # Neutral mouth
            cv2.ellipse(frame, (head_cx, mouth_y), (22, 6), 0, 0, 180, (110, 80, 80), 3)

        # Hand holding phone
        if self._syn_phone:
            phone_x = head_cx + 80
            phone_y = head_cy + 40
            cv2.rectangle(frame, (phone_x - 18, phone_y - 40), (phone_x + 18, phone_y + 40), (20, 20, 25), -1)
            cv2.rectangle(frame, (phone_x - 15, phone_y - 36), (phone_x + 15, phone_y + 36), (80, 140, 220), -1)
            # Hand holding phone
            cv2.circle(frame, (phone_x - 6, phone_y + 25), 24, (185, 205, 230), -1)

        # On-screen HUD watermark
        cv2.putText(frame, "DMS LIVE FEED [SYNTHETIC DRIVER TEST EMULATOR]", (20, 35),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 220, 255), 2)
        cv2.putText(frame, f"FPS: {self.fps_rolling:.1f} | Frame: {self.frame_index}", (20, 65),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (180, 190, 200), 1)

        return frame

    def release(self):
        """Releases the camera hardware."""
        if self.cap and self.cap.isOpened():
            self.cap.release()
            self.cap = None
