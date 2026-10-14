"""Camera Blindness and Obstruction Verification Module.

Measures frame brightness and sharpness (Laplacian variance).
Logs and issues a 'CAMERA BLOCKED' warning if the video feed is unclear, occluded,
pitch black, or heavily blinded by glare for >= 3.0 consecutive seconds.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Tuple
import cv2
import numpy as np


@dataclass
class BlindnessResult:
    is_blocked: bool
    brightness: float
    sharpness: float
    blocked_duration_sec: float
    reason: str  # 'OK', 'TOO_DARK', 'TOO_BRIGHT_GLARE', 'BLURRY_OBSTRUCTED'


class CameraBlindCheck:
    """Monitors incoming frames for lens occlusion, total darkness, glare, or heavy blur."""

    def __init__(
        self,
        min_brightness: float = 18.0,
        max_brightness: float = 245.0,
        min_sharpness: float = 15.0,
        trigger_duration_sec: float = 3.0,
        recovery_duration_sec: float = 1.0,
    ):
        self.min_brightness = min_brightness
        self.max_brightness = max_brightness
        self.min_sharpness = min_sharpness
        self.trigger_duration_sec = trigger_duration_sec
        self.recovery_duration_sec = recovery_duration_sec

        self._blocked_start_time: float | None = None
        self._recovery_start_time: float | None = None
        self._is_currently_blocked = False

    def evaluate(self, frame: np.ndarray, current_timestamp: float | None = None) -> BlindnessResult:
        """Evaluates a frame for optical obstruction."""
        now = current_timestamp if current_timestamp is not None else time.monotonic()

        # Convert to grayscale
        if len(frame.shape) == 3:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        else:
            gray = frame

        brightness = float(np.mean(gray))
        sharpness = float(cv2.Laplacian(gray, cv2.CV_64F).var())

        reason = "OK"
        bad_condition = False

        if brightness < self.min_brightness:
            reason = "TOO_DARK"
            bad_condition = True
        elif brightness > self.max_brightness:
            reason = "TOO_BRIGHT_GLARE"
            bad_condition = True
        elif sharpness < self.min_sharpness:
            reason = "BLURRY_OBSTRUCTED"
            bad_condition = True

        if bad_condition:
            self._recovery_start_time = None
            if self._blocked_start_time is None:
                self._blocked_start_time = now

            duration = now - self._blocked_start_time
            if duration >= self.trigger_duration_sec:
                self._is_currently_blocked = True
        else:
            # Good condition
            self._blocked_start_time = None
            if self._is_currently_blocked:
                if self._recovery_start_time is None:
                    self._recovery_start_time = now
                elif (now - self._recovery_start_time) >= self.recovery_duration_sec:
                    self._is_currently_blocked = False
                    self._recovery_start_time = None
            duration = 0.0

        blocked_duration = (now - self._blocked_start_time) if self._blocked_start_time else 0.0

        return BlindnessResult(
            is_blocked=self._is_currently_blocked,
            brightness=brightness,
            sharpness=sharpness,
            blocked_duration_sec=blocked_duration,
            reason=reason if self._is_currently_blocked or bad_condition else "OK",
        )
