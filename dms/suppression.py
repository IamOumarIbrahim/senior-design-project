"""Nuisance Alarm Suppression and Hysteresis Engine.

Implements:
- Mirror-check suppression: Momentary head turns and glances (< 1.5s) are recognized
  as standard mirror checks and suppressed without alarming the driver.
- Alert cool-down: Prevents buzzing or ringing consecutively for the same ongoing condition.
- State hysteresis: Enforces separate entry and exit thresholds to prevent state flickering.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class AlertDecision:
    should_alert: bool
    alert_tier: int  # 0: None, 1: Attention, 2: Warning, 3: Critical
    event_type: str
    message_en: str
    message_ar: str
    sound_file: Optional[str] = None


class SuppressionEngine:
    """Manages cooldowns, mirror-check duration gates, and alert hysteresis."""

    def __init__(
        self,
        mirror_check_max_sec: float = 1.5,
        distraction_min_sec: float = 2.0,
        cooldown_window_sec: float = 10.0,
        hysteresis_entry_threshold: float = 0.65,
        hysteresis_exit_threshold: float = 0.35,
    ):
        self.mirror_check_max_sec = mirror_check_max_sec
        self.distraction_min_sec = distraction_min_sec
        self.cooldown_window_sec = cooldown_window_sec
        self.entry_threshold = hysteresis_entry_threshold
        self.exit_threshold = hysteresis_exit_threshold

        # Timers
        self._head_turn_start: Optional[float] = None
        self._last_alert_time: Dict[str, float] = {}
        self._active_alerts: Dict[str, bool] = {}

    def evaluate_head_turn(self, head_yaw_deg: float, timestamp: float) -> Tuple[bool, str]:
        """Evaluates whether head turn is a transient mirror check or persistent distraction.

        Returns (is_distraction, status_label)
        """
        is_turned = abs(head_yaw_deg) >= 18.0

        if not is_turned:
            self._head_turn_start = None
            return (False, "FORWARD")

        if self._head_turn_start is None:
            self._head_turn_start = timestamp

        duration = timestamp - self._head_turn_start

        if duration <= self.mirror_check_max_sec:
            return (False, f"MIRROR_CHECK ({duration:.1f}s)")

        if duration >= self.distraction_min_sec:
            return (True, f"DISTRACTED ({duration:.1f}s)")

        return (False, f"CHECKING ({duration:.1f}s)")

    def check_alert(
        self,
        event_key: str,
        filtered_score: float,
        timestamp: float,
        critical_condition: bool = False,
    ) -> Optional[AlertDecision]:
        """Determines whether an alert should sound, enforcing hysteresis and cooldown."""
        is_active = self._active_alerts.get(event_key, False)

        # Hysteresis entry / exit
        if not is_active:
            if filtered_score >= self.entry_threshold or critical_condition:
                self._active_alerts[event_key] = True
                is_active = True
        else:
            if filtered_score < self.exit_threshold and not critical_condition:
                self._active_alerts[event_key] = False
                return None

        if not is_active:
            return None

        # Check cooldown
        last_fired = self._last_alert_time.get(event_key, 0.0)
        if (timestamp - last_fired) < self.cooldown_window_sec:
            return None  # Suppressed by cooldown

        self._last_alert_time[event_key] = timestamp

        # Determine alert tier and messages
        if critical_condition or filtered_score >= 0.85:
            tier = 3  # Critical
            sound = "fatigue_buzz.wav" if "drowsy" in event_key or "sleep" in event_key else "lockon_alarm_sound.wav"
            msg_en = "Emergency: Please pull over safely or keep eyes on the road!"
            msg_ar = "تنبيه طارئ: يرجى التوقف بأمان أو الانتباه إلى الطريق!"
        elif filtered_score >= 0.70:
            tier = 2  # Warning
            sound = "distraction_chime.wav"
            msg_en = "Warning: Focus on the road."
            msg_ar = "تحذير: يرجى التركيز على الطريق."
        else:
            tier = 1  # Gentle attention
            sound = "distraction_chime.wav"
            msg_en = "Notice: Driver distraction detected."
            msg_ar = "ملاحظة: تم رصد تشتت الانتباه."

        return AlertDecision(
            should_alert=True,
            alert_tier=tier,
            event_type=event_key,
            message_en=msg_en,
            message_ar=msg_ar,
            sound_file=sound,
        )
