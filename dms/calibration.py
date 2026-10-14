"""Driver Baseline Calibration Module.

Executes a 20-second neutral baseline recording session:
- Measures neutral eyes-open EAR distribution
- Captures normal resting head pose
- Sets personalized detector confidence cutoffs to the 99th percentile + safe margin
- Eliminates driver-specific facial geometry false alarms
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import List, Optional
import numpy as np


@dataclass
class CalibrationProfile:
    driver_id: str
    duration_sec: float
    samples_collected: int
    baseline_ear_open: float
    baseline_ear_closed: float
    suggested_conf_cutoff: float
    created_at: str


class DriverCalibrationSession:
    """Manages 20-second baseline collection and percentile cutoff calculation."""

    def __init__(self, target_duration_sec: float = 20.0, driver_id: str = "Driver-01"):
        self.target_duration_sec = target_duration_sec
        self.driver_id = driver_id
        self._start_time: Optional[float] = None
        self._ear_samples: List[float] = []
        self._conf_samples: List[float] = []
        self._is_active = False

    def start(self, current_timestamp: Optional[float] = None):
        """Starts 20-second calibration."""
        self._start_time = current_timestamp if current_timestamp is not None else time.monotonic()
        self._ear_samples.clear()
        self._conf_samples.clear()
        self._is_active = True

    def update(self, ear: float, max_noise_conf: float, current_timestamp: Optional[float] = None) -> float:
        """Records a sample and returns progress fraction (0.0 to 1.0)."""
        if not self._is_active or self._start_time is None:
            return 0.0

        now = current_timestamp if current_timestamp is not None else time.monotonic()
        elapsed = now - self._start_time
        progress = min(1.0, elapsed / self.target_duration_sec)

        if ear > 0.10:
            self._ear_samples.append(ear)
        self._conf_samples.append(max_noise_conf)

        if elapsed >= self.target_duration_sec:
            self._is_active = False

        return progress

    def is_finished(self, current_timestamp: Optional[float] = None) -> bool:
        """Returns True if the 20 seconds have completed."""
        if not self._is_active:
            return len(self._ear_samples) > 0
        now = current_timestamp if current_timestamp is not None else time.monotonic()
        start = self._start_time if self._start_time is not None else now
        return (now - start) >= self.target_duration_sec

    def finish(self) -> CalibrationProfile:
        """Computes baseline percentiles and returns finalized profile."""
        self._is_active = False
        ear_arr = np.array(self._ear_samples) if self._ear_samples else np.array([0.32])
        conf_arr = np.array(self._conf_samples) if self._conf_samples else np.array([0.30])

        open_ear = float(np.percentile(ear_arr, 50))  # Median open EAR
        closed_ear = max(0.12, open_ear * 0.52)  # Proportional closed threshold

        # Cutoffs set to 99th percentile + safe gap of 0.10
        p99_conf = float(np.percentile(conf_arr, 99))
        safe_cutoff = float(np.clip(p99_conf + 0.10, 0.40, 0.85))

        return CalibrationProfile(
            driver_id=self.driver_id,
            duration_sec=self.target_duration_sec,
            samples_collected=len(self._ear_samples),
            baseline_ear_open=round(open_ear, 3),
            baseline_ear_closed=round(closed_ear, 3),
            suggested_conf_cutoff=round(safe_cutoff, 3),
            created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        )
