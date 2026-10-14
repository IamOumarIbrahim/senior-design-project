"""Alert Dispatcher and Audio/Visual Notification System.

Plays physical audio alert cues (WAV chimes, buzzers, and multi-lingual voice alerts
in English and Arabic), and controls simulated LED warning bar states without
blocking video processing.
"""

from __future__ import annotations

import os
import sys
import threading
from pathlib import Path
from typing import Optional

try:
    import winsound
except ImportError:
    winsound = None


class AlertManager:
    """Dispatches tiered audio cues and LED alert signals asynchronously."""

    def __init__(self, audio_enabled: bool = True, language: str = "en"):
        self.audio_enabled = audio_enabled
        self.language = language
        self.led_status = "NORMAL"  # 'NORMAL', 'ATTENTION', 'WARNING', 'CRITICAL'
        self._sound_dir = self._find_sound_directory()
        self._lock = threading.Lock()

    def _find_sound_directory(self) -> Path:
        """Locates the repository alarm audio directory."""
        candidates = [
            Path(__file__).parent.parent / "Capstone" / "Alarm",
            Path(__file__).parent.parent / "Alarm",
            Path("Capstone/Alarm"),
        ]
        for p in candidates:
            if p.exists() and (p / "distraction_chime.wav").exists():
                return p.resolve()
        return Path(__file__).parent.parent / "Capstone" / "Alarm"

    def trigger(
        self,
        tier: int,
        sound_filename: Optional[str],
        message_en: str,
        message_ar: str,
    ):
        """Triggers an alert on a background daemon thread so video inference never stutters."""
        # Update LED bar status
        if tier >= 3:
            self.led_status = "CRITICAL"
        elif tier == 2:
            self.led_status = "WARNING"
        elif tier == 1:
            self.led_status = "ATTENTION"
        else:
            self.led_status = "NORMAL"

        msg = message_ar if self.language == "ar" else message_en
        print(f"\n[ALERT TIER {tier}] {self.led_status} LED FLASHING | {msg}")

        if not self.audio_enabled:
            return

        thread = threading.Thread(
            target=self._play_sound_worker,
            args=(sound_filename,),
            daemon=True,
        )
        thread.start()

    def _play_sound_worker(self, sound_filename: Optional[str]):
        """Background worker executing platform audio playback."""
        if not sound_filename:
            return

        sound_path = self._sound_dir / sound_filename
        if not sound_path.exists():
            # Check nested folders if needed
            nested = list(self._sound_dir.glob(f"**/{sound_filename}"))
            if nested:
                sound_path = nested[0]

        if sound_path.exists() and winsound:
            try:
                winsound.PlaySound(str(sound_path), winsound.SND_FILENAME | winsound.SND_ASYNC)
            except Exception as e:
                # Fallback to simple console beep
                try:
                    winsound.Beep(1200, 300)
                except Exception:
                    pass
        elif winsound:
            try:
                winsound.Beep(1500, 350)
            except Exception:
                pass

    def clear(self):
        """Resets visual LED bar state to NORMAL."""
        self.led_status = "NORMAL"
