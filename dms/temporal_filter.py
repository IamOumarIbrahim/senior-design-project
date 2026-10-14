"""Temporal Filtering Module for False Alarm Reduction.

Implements an Exponential Moving Average (EMA) filter defined strictly in
seconds (time-based decay), ensuring identical filtering behavior across
different camera framerates (e.g., 10, 15, or 30 FPS). Suppresses random single-frame spikes.
"""

from __future__ import annotations

import math
from typing import Dict


class TemporalFilter:
    """Time-constant continuous Exponential Moving Average filter."""

    def __init__(self, time_constant_sec: float = 0.8):
        """Args:

        time_constant_sec: The smoothing window in seconds.
                           Higher values suppress spikes more aggressively.
        """
        self.tau = max(0.05, time_constant_sec)
        self.state: Dict[str, float] = {}
        self.last_update_time: Dict[str, float] = {}

    def update(self, key: str, raw_score: float, current_timestamp: float) -> float:
        """Updates score for given class/channel using elapsed time dt."""
        if key not in self.state:
            self.state[key] = float(raw_score)
            self.last_update_time[key] = current_timestamp
            return self.state[key]

        last_time = self.last_update_time.get(key, current_timestamp)
        dt = max(0.0, current_timestamp - last_time)
        self.last_update_time[key] = current_timestamp

        # Compute continuous-time alpha: alpha = 1 - exp(-dt / tau)
        alpha = 1.0 - math.exp(-dt / self.tau)
        alpha = min(1.0, max(0.0, alpha))

        prev = self.state[key]
        filtered = (1.0 - alpha) * prev + alpha * float(raw_score)
        self.state[key] = filtered
        return filtered

    def get(self, key: str) -> float:
        """Returns the current filtered score for a class."""
        return self.state.get(key, 0.0)

    def reset(self, key: str | None = None):
        """Resets filter state."""
        if key:
            self.state.pop(key, None)
            self.last_update_time.pop(key, None)
        else:
            self.state.clear(
                self.last_update_time.clear()
            )
