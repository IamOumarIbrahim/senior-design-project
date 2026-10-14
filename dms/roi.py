"""Driver-Centered Region of Interest (ROI) Tracking Module.

Dynamically tracks the driver's face location and extracts a stable, smooth
cropped region (e.g., 640x640) from the full 1080p frame. This drastically reduces
GFLOPs and boosts FPS while retaining high facial resolution for cue detection.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Tuple
import cv2
import numpy as np


@dataclass
class RoiCrop:
    cropped_frame: np.ndarray
    x: int
    y: int
    width: int
    height: int
    face_detected: bool


class DriverRoiTracker:
    """Tracks driver face center and extracts an adaptive stabilized ROI."""

    def __init__(
        self,
        crop_size: int = 640,
        smoothing_factor: float = 0.25,
        detection_interval_frames: int = 15,
    ):
        self.crop_size = crop_size
        self.smoothing_factor = smoothing_factor
        self.detection_interval_frames = detection_interval_frames

        self._current_cx = -1.0
        self._current_cy = -1.0
        self._target_cx = -1.0
        self._target_cy = -1.0
        self._frame_count = 0

        # Load OpenCV Haar cascade as ultra-fast fallback face detector
        self._cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )

    def process(self, frame: np.ndarray) -> RoiCrop:
        """Processes a frame, updating driver center tracking and returning cropped ROI."""
        h, w = frame.shape[:2]
        self._frame_count += 1

        # Initialize to frame center if first frame
        if self._current_cx < 0 or self._current_cy < 0:
            self._current_cx = w / 2.0
            self._current_cy = h * 0.45
            self._target_cx = self._current_cx
            self._target_cy = self._current_cy

        # Periodic face detection at lower resolution
        face_found = False
        if (self._frame_count % self.detection_interval_frames == 0) or (self._frame_count <= 3):
            small_w, small_h = 320, int(320 * (h / w))
            small_gray = cv2.resize(frame, (small_w, small_h))
            if len(small_gray.shape) == 3:
                small_gray = cv2.cvtColor(small_gray, cv2.COLOR_BGR2GRAY)

            faces = self._cascade.detectMultiScale(
                small_gray, scaleFactor=1.15, minNeighbors=3, minSize=(30, 30)
            )

            if len(faces) > 0:
                # Find largest face (driver)
                largest = max(faces, key=lambda b: b[2] * b[3])
                fx, fy, fw, fh = largest
                scale_x = w / small_w
                scale_y = h / small_h
                self._target_cx = (fx + fw / 2.0) * scale_x
                self._target_cy = (fy + fh / 2.0) * scale_y
                face_found = True

        # Exponential smoothing of crop center
        self._current_cx += self.smoothing_factor * (self._target_cx - self._current_cx)
        self._current_cy += self.smoothing_factor * (self._target_cy - self._current_cy)

        # Calculate bounding box bounds clamped to frame edges
        half = self.crop_size // 2
        x1 = int(round(self._current_cx - half))
        y1 = int(round(self._current_cy - half))

        x1 = max(0, min(x1, w - self.crop_size))
        y1 = max(0, min(y1, h - self.crop_size))
        x2 = min(w, x1 + self.crop_size)
        y2 = min(h, y1 + self.crop_size)

        actual_w = x2 - x1
        actual_h = y2 - y1

        cropped = frame[y1:y2, x1:x2]
        if actual_w != self.crop_size or actual_h != self.crop_size:
            cropped = cv2.resize(cropped, (self.crop_size, self.crop_size))

        return RoiCrop(
            cropped_frame=cropped,
            x=x1,
            y=y1,
            width=actual_w,
            height=actual_h,
            face_detected=face_found,
        )
