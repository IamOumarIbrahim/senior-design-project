"""Lightweight Local HTTP/JSON and MJPEG Video Streaming Bridge Server.

Exposes REST and video streaming endpoints on localhost:8765 for seamless
integration with the Electron desktop app and tablet interface:
- GET  /api/status: Current telemetry, risks, EAR, PERCLOS, alerts
- GET  /api/frame: Latest annotated JPEG frame
- GET  /api/video_feed: Continuous MJPEG video stream
- POST /api/start: Starts edge monitoring session
- POST /api/stop: Stops edge monitoring session
- POST /api/calibrate: Starts 20s driver baseline calibration
- POST /api/readiness: Evaluates pre-trip driver readiness
- GET  /api/rest-stops: Queries nearest GPS rest areas
- POST /api/cue: Injects test cues (phone, yawn, closed_eyes, normal)
- POST /api/alert/test: Plays test alert audio
"""

from __future__ import annotations

import json
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Optional
from urllib.parse import parse_qs, urlparse
import cv2

from dms.engine import DmsEngine
from dms.readiness import DriverReadinessCheck
from dms.rest_stops import RestStopRecommender


class DmsServer:
    """Embedded HTTP and MJPEG streaming server."""

    def __init__(self, engine: DmsEngine, host: str = "127.0.0.1", port: int = 8765):
        self.engine = engine
        self.host = host
        self.port = port
        self.httpd: Optional[ThreadingHTTPServer] = None
        self._server_thread: Optional[threading.Thread] = None

    def start(self):
        """Starts server in background thread."""
        handler_cls = self._create_handler()
        self.httpd = ThreadingHTTPServer((self.host, self.port), handler_cls)
        self._server_thread = threading.Thread(target=self.httpd.serve_forever, daemon=True)
        self._server_thread.start()
        print(f"[DmsServer] Live HTTP & Video Bridge running at http://{self.host}:{self.port}")

    def stop(self):
        """Stops server."""
        if self.httpd:
            self.httpd.shutdown()
            self.httpd.server_close()
            self.httpd = None

    def _create_handler(self):
        engine = self.engine

        class DmsHandler(BaseHTTPRequestHandler):
            def log_message(self, format, *args):
                pass  # Suppress console clutter for high-frequency frame polls

            def _send_cors_headers(self):
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                self.send_header("Access-Control-Allow-Headers", "Content-Type")

            def do_OPTIONS(self):
                self.send_response(200)
                self._send_cors_headers()
                self.end_headers()

            def do_GET(self):
                url = urlparse(self.path)

                if url.path == "/api/status":
                    self.send_response(200)
                    self._send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()

                    telem = engine._last_telemetry
                    payload = telem.__dict__ if telem else {"state": "IDLE", "fps": 0.0}
                    self.wfile.write(json.dumps(payload).encode("utf-8"))

                elif url.path == "/api/frame":
                    frame = engine._last_annotated_frame
                    if frame is None:
                        frame = engine.camera._generate_synthetic_frame(time.monotonic())

                    ret, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                    if ret:
                        self.send_response(200)
                        self._send_cors_headers()
                        self.send_header("Content-Type", "image/jpeg")
                        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
                        self.end_headers()
                        self.wfile.write(buf.tobytes())
                    else:
                        self.send_error(500)

                elif url.path == "/api/video_feed":
                    self.send_response(200)
                    self._send_cors_headers()
                    self.send_header("Content-Type", "multipart/x-mixed-replace; boundary=frame")
                    self.end_headers()

                    try:
                        while engine.is_running:
                            frame = engine._last_annotated_frame
                            if frame is not None:
                                ret, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
                                if ret:
                                    self.wfile.write(b"--frame\r\n")
                                    self.wfile.write(b"Content-Type: image/jpeg\r\n\r\n")
                                    self.wfile.write(buf.tobytes())
                                    self.wfile.write(b"\r\n")
                            time.sleep(0.033)
                    except (BrokenPipeError, ConnectionResetError):
                        pass

                elif url.path == "/api/rest-stops":
                    params = parse_qs(url.query)
                    lat = float(params.get("lat", [25.2048])[0])
                    lon = float(params.get("lon", [55.2708])[0])
                    stops = RestStopRecommender.get_recommendations(lat, lon)

                    self.send_response(200)
                    self._send_cors_headers()
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps([s.__dict__ for s in stops]).encode("utf-8"))

                else:
                    self.send_error(404)

            def do_POST(self):
                url = urlparse(self.path)
                content_len = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_len).decode("utf-8") if content_len > 0 else "{}"
                data = {}
                try:
                    data = json.loads(body)
                except Exception:
                    pass

                self.send_response(200)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()

                if url.path == "/api/start":
                    if not engine.is_running:
                        engine.start()
                    self.wfile.write(json.dumps({"success": True, "trip_id": engine.trip_id}).encode("utf-8"))

                elif url.path == "/api/stop":
                    if engine.is_running:
                        engine.stop()
                    self.wfile.write(json.dumps({"success": True}).encode("utf-8"))

                elif url.path == "/api/calibrate":
                    engine.calibration.start()
                    self.wfile.write(json.dumps({"success": True, "message": "Calibration started for 20 seconds"}).encode("utf-8"))

                elif url.path == "/api/readiness":
                    sleep_h = float(data.get("sleep_hours", 7.0))
                    fatigue = int(data.get("fatigue_level", 2))
                    trip_h = float(data.get("planned_trip_hours", 1.0))
                    res = DriverReadinessCheck.evaluate(sleep_h, fatigue, trip_h)
                    engine.db.log_readiness(res.score, res.status, sleep_h, fatigue, " | ".join(res.recommendations))
                    self.wfile.write(json.dumps(res.__dict__).encode("utf-8"))

                elif url.path == "/api/cue":
                    cue = data.get("cue", "normal")
                    engine.camera.trigger_synthetic_cue(cue)
                    self.wfile.write(json.dumps({"success": True, "cue": cue}).encode("utf-8"))

                elif url.path == "/api/alert/test":
                    sound = data.get("sound", "distraction_chime.wav")
                    engine.alert_manager.trigger(2, sound, "Test Audio Alert Triggered", "تم تشغيل تنبيه صوتي تجريبي")
                    self.wfile.write(json.dumps({"success": True, "sound": sound}).encode("utf-8"))

                else:
                    self.wfile.write(json.dumps({"error": "Unknown endpoint"}).encode("utf-8"))

        return DmsHandler
