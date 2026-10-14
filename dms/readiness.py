"""Pre-Trip Driver Readiness Check Module.

Presents a brief pre-drive assessment evaluating:
- Sleep duration in the previous 24 hours
- Self-reported alertness scale (Karolinska Sleepiness Scale equivalent 1-5)
- Planned trip duration
Provides actionable pre-trip tips and recommendations (e.g., rest recommendation
prior to high-speed UAE highway transit).
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import List


@dataclass
class ReadinessResult:
    score: int  # 0 to 100
    status: str  # 'FIT_TO_DRIVE', 'CAUTION_MONITORED', 'UNFIT_REST_RECOMMENDED'
    recommendations: List[str]
    sleep_hours: float
    fatigue_level: int
    timestamp: str


class DriverReadinessCheck:
    """Evaluates driver fitness to drive before journey commencement."""

    @staticmethod
    def evaluate(
        sleep_hours: float,
        fatigue_level: int,  # 1 (Very alert) to 5 (Exhausted / Nodding off)
        planned_trip_hours: float = 1.0,
    ) -> ReadinessResult:
        """Computes fitness score and personalized safety advice."""
        score = 100

        # Sleep penalty
        if sleep_hours < 4.5:
            score -= 45
        elif sleep_hours < 6.0:
            score -= 25
        elif sleep_hours < 7.0:
            score -= 10

        # Self-reported fatigue penalty (1 = best, 5 = worst)
        fatigue_penalties = {1: 0, 2: 10, 3: 25, 4: 45, 5: 65}
        score -= fatigue_penalties.get(fatigue_level, 20)

        # Long trip fatigue compounding
        if planned_trip_hours >= 2.5:
            score -= 15

        score = max(5, min(100, score))
        recommendations = []

        if score >= 75:
            status = "FIT_TO_DRIVE"
            recommendations.append("Driver readiness optimal. Maintain cabin airflow and stay hydrated.")
        elif score >= 50:
            status = "CAUTION_MONITORED"
            recommendations.append("Elevated fatigue risk detected. DMS sensitivity set to high.")
            recommendations.append("Plan a 15-minute rest stop after 45 minutes of driving.")
        else:
            status = "UNFIT_REST_RECOMMENDED"
            recommendations.append("High micro-sleep vulnerability! Severe sleep deficit reported.")
            recommendations.append("Recommendation: Take a 20-30 minute power nap before departure.")
            recommendations.append("Consider postponing the trip or using public transportation.")

        return ReadinessResult(
            score=score,
            status=status,
            recommendations=recommendations,
            sleep_hours=sleep_hours,
            fatigue_level=fatigue_level,
            timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        )
