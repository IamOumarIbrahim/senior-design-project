"""Comprehensive Automated Test Suite for Driver Monitoring System (DMS).

Tests all edge perception, filtering, suppression, calibration, and database logging modules.
"""

import os
import tempfile
import time
import unittest
import numpy as np

from dms.camera import CameraFeed
from dms.blindness import CameraBlindCheck
from dms.roi import DriverRoiTracker
from dms.detector import DriverBehaviorDetector
from dms.eye_tracker import EyeTracker
from dms.temporal_filter import TemporalFilter
from dms.suppression import SuppressionEngine
from dms.calibration import DriverCalibrationSession
from dms.readiness import DriverReadinessCheck
from dms.rest_stops import RestStopRecommender
from dms.database import DmsDatabaseLogger
from dms.engine import DmsEngine


class TestDmsModules(unittest.TestCase):
    """Unit and integration tests for DMS software modules."""

    def test_camera_synthetic_generation(self):
        """Verifies synthetic frame generation produces valid 3-channel BGR images."""
        feed = CameraFeed(source="synthetic", target_width=640, target_height=480)
        self.assertTrue(feed.open())
        data = feed.read()
        self.assertIsNotNone(data)
        self.assertEqual(data.frame.shape, (480, 640, 3))
        self.assertTrue(data.is_synthetic)
        feed.release()

    def test_camera_blindness_detection(self):
        """Verifies camera obstruction triggers CAMERA_BLOCKED after 3 seconds."""
        checker = CameraBlindCheck(min_brightness=20.0, trigger_duration_sec=3.0)
        dark_frame = np.zeros((480, 640, 3), dtype=np.uint8)

        t0 = 1000.0
        # Instantaneously dark - not blocked yet
        res0 = checker.evaluate(dark_frame, current_timestamp=t0)
        self.assertFalse(res0.is_blocked)
        self.assertEqual(res0.reason, "TOO_DARK")

        # 2 seconds later - still waiting for 3s threshold
        res1 = checker.evaluate(dark_frame, current_timestamp=t0 + 2.0)
        self.assertFalse(res1.is_blocked)

        # 3.2 seconds later - blocked condition satisfied!
        res2 = checker.evaluate(dark_frame, current_timestamp=t0 + 3.2)
        self.assertTrue(res2.is_blocked)
        self.assertGreaterEqual(res2.blocked_duration_sec, 3.0)

    def test_roi_cropping(self):
        """Verifies driver ROI tracking returns valid cropped region."""
        tracker = DriverRoiTracker(crop_size=320)
        test_frame = np.full((720, 1280, 3), 100, dtype=np.uint8)
        crop = tracker.process(test_frame)
        self.assertEqual(crop.cropped_frame.shape, (320, 320, 3))
        self.assertGreaterEqual(crop.x, 0)
        self.assertGreaterEqual(crop.y, 0)

    def test_eye_tracker_and_perclos(self):
        """Verifies EAR calculation, blink detection, and PERCLOS over time."""
        tracker = EyeTracker(perclos_window_sec=60.0, perclos_coverage_min=0.50)
        feed = CameraFeed(source="synthetic", target_width=320, target_height=320)
        feed.open()
        frame = feed.read().frame
        feed.release()

        t = 100.0
        # Normal open-eye observation
        res_open = tracker.process(frame, timestamp=t)
        self.assertGreater(res_open.avg_ear, 0.20)

        # 20 observations over 20 seconds to establish coverage
        for i in range(25):
            t += 1.0
            res = tracker.process(frame, timestamp=t)

        self.assertIsNotNone(res.perclos_60s)
        self.assertGreater(res.perclos_coverage, 0.50)

    def test_temporal_ema_filter_spike_suppression(self):
        """Verifies that single-frame random noise is suppressed by the EMA filter."""
        filt = TemporalFilter(time_constant_sec=1.0)
        t = 100.0

        # Start at 0
        s0 = filt.update("distraction", 0.0, t)
        self.assertEqual(s0, 0.0)

        # Single frame spike to 1.0 (dt = 0.033s for 30 FPS)
        t += 0.033
        spike_score = filt.update("distraction", 1.0, t)
        # Spike should be heavily dampened (< 0.15)
        self.assertLess(spike_score, 0.15)

        # Sustained detection over 1.5 seconds should ramp up
        for _ in range(45):
            t += 0.033
            sustained_score = filt.update("distraction", 1.0, t)
        self.assertGreater(sustained_score, 0.70)

    def test_mirror_check_suppression(self):
        """Verifies momentary head glance (< 1.5s) is not treated as a distraction alert."""
        engine = SuppressionEngine(mirror_check_max_sec=1.5, distraction_min_sec=2.0)
        t = 50.0

        # Head turns to mirror (25 degrees)
        is_distract, status = engine.evaluate_head_turn(head_yaw_deg=25.0, timestamp=t)
        self.assertFalse(is_distract)
        self.assertIn("MIRROR_CHECK", status)

        # 0.8 seconds into glance
        is_distract, status = engine.evaluate_head_turn(head_yaw_deg=25.0, timestamp=t + 0.8)
        self.assertFalse(is_distract)
        self.assertIn("MIRROR_CHECK", status)

        # Returns to road before 1.5s limit
        is_distract, status = engine.evaluate_head_turn(head_yaw_deg=0.0, timestamp=t + 1.2)
        self.assertFalse(is_distract)
        self.assertEqual(status, "FORWARD")

    def test_driver_calibration(self):
        """Verifies 20s calibration session computes 99th percentile cutoff."""
        calib = DriverCalibrationSession(target_duration_sec=20.0, driver_id="P01")
        calib.start(current_timestamp=0.0)

        # Feed 100 samples
        for i in range(100):
            t = (i / 100.0) * 20.0
            calib.update(ear=0.34, max_noise_conf=0.20, current_timestamp=t)

        self.assertTrue(calib.is_finished(current_timestamp=20.1))
        profile = calib.finish()
        self.assertEqual(profile.driver_id, "P01")
        self.assertAlmostEqual(profile.baseline_ear_open, 0.34, places=2)
        self.assertGreater(profile.suggested_conf_cutoff, 0.25)

    def test_readiness_scoring(self):
        """Verifies pre-trip readiness check flags severe fatigue."""
        # Good driver
        res_good = DriverReadinessCheck.evaluate(sleep_hours=8.0, fatigue_level=1, planned_trip_hours=1.0)
        self.assertEqual(res_good.status, "FIT_TO_DRIVE")
        self.assertGreaterEqual(res_good.score, 80)

        # Severe sleep deficit
        res_poor = DriverReadinessCheck.evaluate(sleep_hours=3.0, fatigue_level=5, planned_trip_hours=3.0)
        self.assertEqual(res_poor.status, "UNFIT_REST_RECOMMENDED")
        self.assertLess(res_poor.score, 40)

    def test_gps_rest_stops(self):
        """Verifies GPS distance calculation and POI retrieval."""
        stops = RestStopRecommender.get_recommendations(current_lat=25.2048, current_lon=55.2708, max_results=3)
        self.assertEqual(len(stops), 3)
        self.assertTrue(all(s.distance_km > 0.0 for s in stops))
        self.assertTrue(all(len(s.amenities) > 0 for s in stops))

    def test_database_wal_logging(self):
        """Verifies SQLite storage creates tables, logs trips and detections in WAL mode."""
        with tempfile.NamedTemporaryFile(suffix=".sqlite", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            logger = DmsDatabaseLogger(db_path=tmp_path)
            trip_id = logger.start_trip("test_trip_101")
            self.assertEqual(trip_id, "test_trip_101")

            det_id = logger.log_detection(
                trip_id="test_trip_101",
                category="distraction",
                class_name="Holding a phone",
                confidence=0.88,
                duration_sec=4,
                severity="medium",
                details="Phone held near ear",
            )
            self.assertTrue(det_id.startswith("det_"))

            logger.close()
        finally:
            import gc
            gc.collect()
            try:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
            except Exception:
                pass

    def test_full_engine_dry_run(self):
        """Executes full integrated engine pipeline for 30 frames."""
        with tempfile.NamedTemporaryFile(suffix=".sqlite", delete=False) as tmp:
            tmp_path = tmp.name

        try:
            engine = DmsEngine(camera_source="synthetic", audio_enabled=False, db_path=tmp_path)
            engine.start()

            for i in range(30):
                frame, telem = engine.step()
                self.assertIsNotNone(frame)
                self.assertIsNotNone(telem)
                self.assertIn(telem.state, ["NORMAL", "ATTENTION", "WARNING", "CRITICAL"])

            engine.stop()
            engine.db.close()
        finally:
            import gc
            gc.collect()
            try:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
            except Exception:
                pass


if __name__ == "__main__":
    unittest.main()
