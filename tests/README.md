# Test Suite (`tests/`)

Automated verification suites covering edge DMS processing logic, mathematical filters, suppression windows, and SQLite WAL database persistence.

## Files

- `test_dms_engine.py`: Comprehensive Python `unittest` test suite covering the edge DMS engine:
  - `BlindnessDetector` brightness and Laplacian variance thresholds.
  - `EyeTracker` EAR calculation, eye blink counting, micro-sleep detection, and PERCLOS calculation.
  - `ContinuousEMA` dynamic time-delta smoothing.
  - `SuppressionManager` mirror-glance suppression (<1.5s), alert cooldowns (10s), and state hysteresis.
  - `DriverReadinessSurvey` psychometric scoring and safety advisory dispatch.
  - `RestStopService` GPS-based nearest UAE highway rest stop lookup.
  - `DMSDatabase` SQLite WAL transaction safety, event insertion, session aggregation, and safe truncation checkpoints.
- `verify-db.js`: Node.js automated verification script testing SQLite schema creation, WAL mode configuration, trip insertion, alert event logging, real-time metrics telemetry writes, and aggregate analytics queries.

## Running Tests

```bash
# Python DMS engine unit tests
python -m unittest tests/test_dms_engine.py

# SQLite Node.js schema and transaction verification tests
npm test
```
