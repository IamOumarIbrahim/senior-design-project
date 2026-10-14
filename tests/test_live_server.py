"""Integration test for DmsServer HTTP & Streaming API endpoints."""

import json
import time
import unittest
import urllib.request
import urllib.error
import os

from dms.engine import DmsEngine
from dms.server import DmsServer


class TestDmsServerLive(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Initialize engine with synthetic camera and test DB
        cls.db_path = "test_live_server.sqlite"
        cls.engine = DmsEngine(camera_source="synthetic", audio_enabled=False, db_path=cls.db_path)
        cls.engine.start()
        
        # Start server on test port 8766 to avoid collision with port 8765
        cls.server = DmsServer(cls.engine, host="127.0.0.1", port=8766)
        cls.server.start()
        time.sleep(0.5)

    @classmethod
    def tearDownClass(cls):
        cls.server.stop()
        cls.engine.stop()
        cls.engine.db.close()
        for ext in ["", "-wal", "-shm"]:
            p = f"{cls.db_path}{ext}"
            if os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass

    def test_01_api_status(self):
        # Process a frame to populate telemetry
        self.engine.step()
        
        req = urllib.request.Request("http://127.0.0.1:8766/api/status")
        with urllib.request.urlopen(req, timeout=3) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertIn("fps", data)
            self.assertIn("state", data)
            self.assertIn("ear", data)
            self.assertIn("led_status", data)

    def test_02_api_frame(self):
        req = urllib.request.Request("http://127.0.0.1:8766/api/frame")
        with urllib.request.urlopen(req, timeout=3) as resp:
            self.assertEqual(resp.status, 200)
            self.assertEqual(resp.headers.get("Content-Type"), "image/jpeg")
            img_bytes = resp.read()
            self.assertGreater(len(img_bytes), 1000)

    def test_03_api_rest_stops(self):
        req = urllib.request.Request("http://127.0.0.1:8766/api/rest-stops?lat=25.2048&lon=55.2708")
        with urllib.request.urlopen(req, timeout=3) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertIsInstance(data, list)
            self.assertGreaterEqual(len(data), 1)
            self.assertIn("name", data[0])
            self.assertIn("distance_km", data[0])

    def test_04_api_readiness_post(self):
        body = json.dumps({"sleep_hours": 8.0, "hours_awake": 2.0, "fatigue_scale": 1}).encode("utf-8")
        req = urllib.request.Request(
            "http://127.0.0.1:8766/api/readiness",
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=3) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertIn("score", data)
            self.assertIn("status", data)
            self.assertGreaterEqual(data["score"], 80)

    def test_05_api_cue_injection(self):
        body = json.dumps({"cue": "holding_phone"}).encode("utf-8")
        req = urllib.request.Request(
            "http://127.0.0.1:8766/api/cue",
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=3) as resp:
            self.assertEqual(resp.status, 200)
            data = json.loads(resp.read().decode("utf-8"))
            self.assertEqual(data.get("cue"), "holding_phone")


if __name__ == "__main__":
    unittest.main()
