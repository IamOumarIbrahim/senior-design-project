# VigilBench — Driver Drowsiness & Distraction Detection Build Specification

> This document is an execution specification for an autonomous coding agent with shell, filesystem, Python, webcam, and local Git access on Windows 11. Execute modules in order. A module is complete only after every gate has been run and its real evidence has been saved. Never fabricate participant data, labels, benchmark results, command output, or completion evidence.

---

## 1. Project Metadata

| Field | Value |
|---|---|
| Academic project | Senior Design Project |
| Initial title | Driver Drowsiness & Distraction Detection |
| Proposed project name | VigilBench |
| Proposed full title | VigilBench: A Temporal Driver Drowsiness and Distraction Detection Benchmark |
| Supervisor | Dr. Mohamad Khairi Bin Ishak |
| Team member | OUMAR MAMOUN IBRAHIM — U22200741 |
| Team member | ABDULLAH JAFAR ABDELHAMID — U23101327 |
| Team member | FARIS MUNADHIL AHMED ALAGHA — U23104246 |
| Team member | MOHAMED AHMED SAAD KHAFAGY — U20101649 |
| v1 platform | Windows 11 laptop/PC |
| Primary sensor | Integrated or USB RGB webcam |
| Processing | Local after dependencies and model assets are installed |
| Intended use | Academic research prototype and benchmark |
| Safety status | Not an automotive safety product, medical device, or production driver-monitoring system |

---

## 2. Summary

VigilBench is a webcam-based research prototype that detects visible cues associated with driver drowsiness and visual distraction over time. It must not be another single-frame Eye Aspect Ratio alarm. The system must extract interpretable facial features, measure PERCLOS and attention-related behavior over timestamped windows, handle glasses and dim lighting honestly, and distinguish valid observations from tracking failure.

V1 must deliver two things:

1. A real-time local demo that produces drowsiness risk, distraction risk, an overall state, and visual/audio alerts.
2. A reproducible benchmark that compares a naive single-frame rule, a deterministic temporal-fusion engine, a classical feature-window model, and an optional GRU challenger using held-out participants.

The GRU is an experiment, not an automatic product decision. The deterministic temporal-fusion engine remains the runtime default unless the GRU passes the qualification gates in this specification.

---

## 3. Locked Product Decisions

Before adding any model, service, dependency, or interface, ask:

> Does v1 need this to satisfy a tested requirement?

The following decisions are locked:

- Run v1 on a laptop/PC webcam only.
- Use a pretrained face-landmark model; do not train a raw-video CNN or Transformer.
- Use MediaPipe Face Landmarker and OpenCV for the real-time vision pipeline.
- Implement calibration and observation-quality handling before implementing alert logic.
- Use deterministic temporal fusion as the reliable runtime baseline.
- Implement one classical feature-window baseline and one small GRU challenger for comparison.
- Evaluate with participant-separated folds; frame-level random train/test splits are forbidden.
- Treat normal RGB dim-light testing as dim-light testing, not true nighttime testing.
- Clear prescription glasses are in scope. Sunglasses and strongly tinted lenses are out of scope for the primary v1 claim.
- Process locally. Do not build a cloud backend, account system, database server, web dashboard, or remote API.
- Do not retain participant video by default after approved feature extraction and verification.
- Do not claim physiological drowsiness. V1 detects visible behavioral cues associated with drowsiness and distraction under a scripted, stationary protocol.

---

## 4. Scope

### 4.1 In Scope for v1

- Windows 11 laptop or desktop execution.
- One integrated or USB RGB webcam.
- One visible face at a time.
- Live camera and file/replay input modes.
- Face landmarks, iris landmarks when available, and head-pose estimates.
- Per-session calibration for:
  - Neutral eyes open.
  - Brief eyes closed.
  - Forward head pose.
  - Head left and right.
  - Looking downward.
- Observation quality states: `VALID`, `DEGRADED`, and `INVALID`.
- Features:
  - Left and right EAR.
  - Normalized eye closure.
  - Blink events and blink duration.
  - Prolonged eye closure.
  - Timestamp-based PERCLOS.
  - MAR and yawn-cue duration.
  - Head yaw, pitch, and roll estimates.
  - Iris/eye-position attention proxy when quality permits.
  - Face presence and landmark confidence/visibility indicators.
- Independent risk channels:
  - Drowsiness risk.
  - Distraction risk.
- Runtime states:
  - `ALERT`.
  - `DROWSY`.
  - `DISTRACTED`.
  - `DROWSY_AND_DISTRACTED`.
  - `UNKNOWN`.
- Persistence, hysteresis, cooldown, and stale-data handling.
- Local visual and audible warning.
- Anonymous event and metric logging.
- Safe, stationary, scripted team data collection.
- Clear-glasses/no-glasses and normal/dim-light comparison.
- Leave-one-participant-out evaluation.
- Per-participant and subgroup metrics.
- False alerts per minute, event recall, event precision, detection delay, unavailable-prediction rate, and valid-observation coverage.
- CSV, JSON, and generated Markdown reports.
- A private error table with representative failed event IDs; no polished public failure gallery is required in v1.

### 4.2 Explicitly Deferred to v2

- Raspberry Pi, Jetson, embedded deployment, or vehicle power integration.
- Infrared cameras and true darkness operation.
- CAN bus, steering, lane, speed, heart rate, EEG, or other vehicle/biometric sensors.
- Phone or object-use detection.
- Multi-camera support.
- Driver identification.
- Public dataset adapters as a critical dependency.
- NTHU-DDD or other licensed dataset acquisition automation.
- Cloud inference, remote telemetry, accounts, or a web application.
- Public failure-gallery website.
- Automotive certification, ISO 26262, or regulatory claims.
- Medical diagnosis or accident-prevention claims.

---

## 5. Research Claims and Non-Claims

### 5.1 Claims v1 May Make if Supported by Results

- The system detects scripted visible drowsiness cues and visual-distraction cues from a standard RGB webcam.
- Temporal features reduce selected single-frame false alarms under the tested protocol.
- Performance is measured separately for clear glasses/no glasses and normal/dim lighting.
- The system runs locally on the designated Windows test laptop.

### 5.2 Claims v1 Must Not Make

- It detects true physiological sleepiness.
- It works in total darkness.
- It generalizes to the driving population.
- It is safe for use in a moving vehicle.
- It prevents accidents.
- It works with sunglasses unless separately measured and explicitly reported.
- Results from four team participants are population-level evidence.

All final reports must label the study as a pilot with a small convenience sample.

---

## 6. Success Criteria

The project is complete only when the following are demonstrated with real evidence:

1. The application runs from a webcam and from a deterministic replay source.
2. Missing or low-quality observations become `UNKNOWN`; they are never silently treated as `ALERT`.
3. Synthetic sequence tests prove that one noisy frame does not trigger an alert and sustained events do.
4. PERCLOS uses elapsed valid time, not raw frame count.
5. The data protocol includes all four team members, anonymous participant IDs, no driving, and no sleep deprivation.
6. All model evaluation uses leave-one-participant-out folds or an equivalent participant-disjoint procedure.
7. Smoke-test fixture results are marked `SMOKE_TEST_ONLY` and cannot satisfy real-data gates.
8. Reports include support counts, per-participant results, subgroup results, valid-coverage rate, unavailable-prediction rate, false alerts per minute, event recall, event precision, and detection delay.
9. The GRU is promoted only if it passes every qualification rule in Section 18.1.
10. Raw participant videos, face images, consent records, and personal calibration profiles are not committed to Git.
11. The integrated pipeline processes the designated test camera at a measured rate suitable for a live demo, with performance reported honestly even if the target is missed.
12. A clean Windows setup can install dependencies, download model assets, run automated tests, run replay inference, and generate the benchmark report from documented commands.

---

## 7. Technical Stack

| Layer | Choice | Reason |
|---|---|---|
| Language | Python 3.11, 64-bit | Broad Windows support for MediaPipe, OpenCV, PyTorch, and scientific tooling. |
| Environment | `venv` + `pip` | Standard and low-complexity Windows workflow. |
| Packaging | `pyproject.toml` | Central dependency and tool configuration. |
| Capture and rendering | OpenCV | Webcam/file capture, drawing, video writing, timing, and pose utilities. |
| Landmark detection | MediaPipe Face Landmarker Tasks API | Current landmark pipeline with face and iris landmarks where supported. |
| Numeric processing | NumPy | Geometry, normalization, rolling calculations, and masks. |
| Data tables | pandas | Manifests, feature windows, predictions, and reports. |
| Configuration | YAML via PyYAML | Human-readable configuration without an additional validation framework. |
| Metrics and classical model | scikit-learn | Group-aware evaluation, metrics, logistic-regression baseline, and confidence intervals by bootstrap helper code. |
| Sequence challenger | PyTorch GRU | Small temporal feature model; optional at runtime. |
| CLI | Standard-library `argparse` | Avoids an unnecessary command framework. |
| Audio alert | Windows `winsound` with visual fallback | No external audio dependency for the target platform. |
| Tests | pytest | Unit, integration, regression, and synthetic temporal tests. |
| Optional plots | Matplotlib | Generate report figures only; no dashboard or web server. |

### 7.1 Dependency Rules

- Pin compatible direct dependencies after Module 1 proves installation.
- Do not install both `opencv-python` and `opencv-contrib-python`.
- Store downloaded model assets under `models/runtime/`; keep them out of Git.
- Verify model files against `models/manifest.json` using SHA-256.
- The deterministic runtime must operate without loading PyTorch unless `--model gru` is selected.
- Avoid new dependencies unless a gate cannot reasonably be met with the existing stack.

---

## 8. Core Technical Definitions

### 8.1 Eye Aspect Ratio

For six ordered eye points:

```text
EAR = (distance(p2,p6) + distance(p3,p5)) / (2 * distance(p1,p4))
```

Requirements:

- Calculate left and right EAR separately.
- Reject an eye measurement when required landmarks are invalid.
- Normalize closure relative to the session's calibrated open-eye and closed-eye references.
- Do not use one universal EAR threshold as the production decision rule.

### 8.2 Mouth Aspect Ratio

Implement a documented MAR formula using selected outer or inner lip landmarks. Use MAR only as a yawn cue after temporal persistence; a single large-mouth frame cannot trigger `DROWSY`.

### 8.3 Timestamp-Based PERCLOS

For a configurable rolling window, default 60 seconds:

```text
PERCLOS = valid duration classified as closed / total valid observed duration
```

Requirements:

- Use timestamps and interval duration, not frame count.
- Exclude `INVALID` intervals from numerator and denominator.
- Emit PERCLOS as unavailable when valid coverage is below the configured minimum, default 80%.
- Report both the PERCLOS value and valid-coverage fraction.
- Do not evaluate 60-second PERCLOS on clips shorter than the required warm-up and full window.

### 8.4 Head Pose

Use selected 2D landmarks, a documented generic 3D face model, and OpenCV `solvePnP` to estimate yaw, pitch, and roll. When camera intrinsics are approximated, label the outputs as estimates.

### 8.5 Attention Proxy

The webcam does not know the road scene. Therefore:

- Name the feature `attention_direction_proxy`, not `gaze_off_road`.
- Combine head pose and iris position only when both are valid.
- Treat looking down and sustained head-away direction as distraction cues under the controlled camera-placement protocol.
- Do not claim semantic road attention.

### 8.6 Observation Quality

Each frame/window must include:

- `face_present`.
- `left_eye_valid`.
- `right_eye_valid`.
- `iris_valid`.
- `pose_valid`.
- `observation_quality` in `{VALID, DEGRADED, INVALID}`.
- A reason code such as `NO_FACE`, `MULTIPLE_FACES`, `EYE_OCCLUDED`, `LOW_LIGHT`, `LANDMARK_FAILURE`, or `STALE_TIMESTAMP`.

Do not forward-fill invalid measurements as if newly observed. A short configurable hold may be used only for display smoothing and must be marked stale.

### 8.7 Runtime State Contract

The system must maintain two independent scores:

- `drowsiness_risk` in `[0,1]`.
- `distraction_risk` in `[0,1]`.

Derive the displayed state:

| Condition | State |
|---|---|
| Observation unavailable beyond grace period | `UNKNOWN` |
| Both risks above active thresholds | `DROWSY_AND_DISTRACTED` |
| Only drowsiness risk above threshold | `DROWSY` |
| Only distraction risk above threshold | `DISTRACTED` |
| Neither risk above threshold | `ALERT` |

Use persistence and hysteresis for state entry/exit. The exact thresholds must be configurable and documented.

---

## 9. Data Collection Protocol

### 9.1 Safety and Ethics

- Collect data only while participants are seated and stationary.
- Do not collect data while anyone is driving or operating machinery.
- Do not ask participants to become sleep deprived.
- Simulate visible cues only: controlled eye closure, yawning gesture, head turn, and looking down.
- Obtain informed consent before recording.
- Store signed consent records outside the repository.
- Use anonymous IDs `P01` through `P04` in code and reports.
- Allow a participant to stop and request deletion of their raw recordings.
- Do not publish raw face videos without separate explicit consent.

### 9.2 Standardized Setup

Record and enforce the following setup:

- Resolution: 640×480 unless the designated camera cannot provide it reliably.
- Target capture rate: 30 FPS when available; record actual FPS.
- Camera centered approximately at eye level.
- Camera distance documented and held within ±10 cm across sessions.
- Face occupies a documented target range of frame height.
- Participant remains seated in the same marked position.
- Normal-light and dim-light conditions are measured with a lux meter or a consistent phone lux application; record approximate lux and tool used.
- Dim lighting must still permit visible RGB facial detail.
- Clear glasses are allowed; sunglasses and strongly tinted lenses are excluded from the primary matrix.

### 9.3 Minimum Pilot Dataset

Use all four team members.

For each participant and each condition in:

```text
clear_glasses ∈ {no, yes}
lighting ∈ {normal, dim}
```

collect:

1. One continuous alert session of 90–120 seconds for PERCLOS coverage and false-alert measurement.
2. One scripted event session containing at least two repetitions of each:
   - Brief normal blink sequence.
   - Prolonged eye closure of 2–3 seconds.
   - Yawn gesture of 2–4 seconds.
   - Head turned left or right for 2–4 seconds.
   - Looking downward for 2–4 seconds.
   - One combined prolonged-closure and head-away event.

Minimum session count:

```text
4 participants × 2 glasses conditions × 2 lighting conditions × 2 session types = 32 sessions
```

The event-session script must randomize event order between sessions enough to avoid one fixed temporal pattern.

### 9.4 Annotation

- The collection tool records scripted event prompts and timestamps.
- A human reviewer verifies event start/end times after recording.
- At least 25% of event sessions are independently reviewed by a second annotator.
- Report categorical agreement and event-boundary disagreement.
- Target Cohen's kappa: at least 0.70 for event category agreement.
- Target median absolute onset/offset disagreement: at most 0.50 seconds.
- When targets are missed, refine annotation guidance and re-review the affected subset. Do not silently accept unreliable labels.

### 9.5 Retention and Git Policy

- Raw recordings live under `data/private/raw/` and are ignored by Git.
- Derived feature windows may be retained under `data/private/features/` and are ignored by Git.
- Public/committed fixtures contain only synthetic landmarks, synthetic feature streams, and non-identifying generated capture frames.
- Reports use participant IDs only.
- No absolute personal file paths may appear in committed manifests or reports.

---

## 10. Evaluation Protocol

### 10.1 Smoke Test vs Real Evaluation

Every generated dataset and report must include:

```text
evaluation_tier ∈ {SMOKE_TEST_ONLY, REAL_PARTICIPANT_EVALUATION}
```

Rules:

- Synthetic and replay fixtures may prove code execution only.
- A `SMOKE_TEST_ONLY` artifact cannot satisfy model-quality, robustness, or final-results gates.
- Real-data gates must fail clearly when the participant dataset is absent or incomplete.

### 10.2 Participant Separation

Use leave-one-participant-out evaluation:

- Train/calibrate model parameters on three participants.
- Evaluate on the fourth participant.
- Repeat for all four held-out participants.
- Never place windows from one participant in both training and test for the same fold.
- Fit scalers and learned thresholds on training participants only.

Personal runtime calibration is allowed, but evaluation must clearly separate:

- Generic model training.
- Per-session calibration values.
- Held-out event labels.

### 10.3 Required Models

Evaluate all applicable systems on identical held-out windows/events:

1. `single_frame_ear`: fixed single-frame EAR threshold comparator.
2. `deterministic_temporal`: calibrated temporal rules with persistence/hysteresis.
3. `logistic_window`: logistic regression over aggregated feature windows.
4. `gru_challenger`: small GRU over calibrated feature sequences and quality masks.

### 10.4 Required Metrics

For each model and fold, report:

- Macro F1.
- Per-class precision, recall, and F1.
- Confusion matrix counts.
- Event precision and event recall.
- False alerts per minute during continuous alert sessions.
- Median and p95 event detection delay.
- Valid-observation coverage.
- `UNKNOWN`/unavailable prediction rate.
- Support counts.

Aggregate reporting must include:

- Mean and median across held-out participants.
- Per-participant values.
- Minimum and maximum across participants.
- 95% bootstrap confidence intervals when the metric has sufficient samples; otherwise state that the interval is not reliable.

### 10.5 Robustness Slices

Report held-out predictions separately for:

- Clear glasses: no vs yes.
- Lighting: normal vs dim.
- Combined glasses × lighting cells.
- Event type.
- Observation quality.

Never compute robustness claims from training predictions.

---

## 11. Proposed Repository Structure

Create this tree verbatim. Do not add a referenced file later without updating this specification first.

```text
vigilbench/
├── .gitignore
├── README.md
├── pyproject.toml
├── requirements-lock.txt
├── config/
│   ├── default.yaml
│   ├── landmarks.yaml
│   └── thresholds.yaml
├── models/
│   ├── manifest.json
│   ├── runtime/
│   │   └── .gitkeep
│   └── checkpoints/
│       └── .gitkeep
├── src/
│   └── vigilbench/
│       ├── __init__.py
│       ├── __main__.py
│       ├── cli.py
│       ├── config.py
│       ├── capture.py
│       ├── model_assets.py
│       ├── landmarks.py
│       ├── calibration.py
│       ├── quality.py
│       ├── features.py
│       ├── perclos.py
│       ├── temporal.py
│       ├── states.py
│       ├── alerts.py
│       ├── overlay.py
│       ├── logging_io.py
│       ├── manifest.py
│       ├── annotation.py
│       ├── dataset.py
│       ├── baselines.py
│       ├── gru.py
│       ├── training.py
│       ├── evaluation.py
│       ├── robustness.py
│       ├── benchmark.py
│       ├── reporting.py
│       └── app.py
├── scripts/
│   ├── download_models.py
│   ├── generate_fixtures.py
│   ├── record_session.py
│   ├── annotate_session.py
│   ├── build_dataset.py
│   ├── train_models.py
│   ├── evaluate_models.py
│   ├── benchmark_runtime.py
│   ├── generate_report.py
│   └── run_demo.py
├── data/
│   ├── README.md
│   ├── private/
│   │   ├── raw/
│   │   │   └── .gitkeep
│   │   ├── annotations/
│   │   │   └── .gitkeep
│   │   ├── features/
│   │   │   └── .gitkeep
│   │   └── manifests/
│   │       └── .gitkeep
│   └── schemas/
│       ├── session_manifest.schema.json
│       ├── event_annotation.schema.json
│       └── prediction.schema.json
├── tests/
│   ├── conftest.py
│   ├── fixtures/
│   │   ├── synthetic_capture.mp4
│   │   ├── synthetic_landmarks.json
│   │   ├── synthetic_features.csv
│   │   ├── synthetic_events.csv
│   │   └── smoke_manifest.csv
│   ├── test_capture.py
│   ├── test_model_assets.py
│   ├── test_calibration.py
│   ├── test_quality.py
│   ├── test_features.py
│   ├── test_perclos.py
│   ├── test_temporal.py
│   ├── test_states.py
│   ├── test_manifest.py
│   ├── test_annotation.py
│   ├── test_dataset.py
│   ├── test_baselines.py
│   ├── test_gru.py
│   ├── test_evaluation.py
│   ├── test_robustness.py
│   ├── test_benchmark.py
│   └── test_app.py
├── docs/
│   ├── DATA_PROTOCOL.md
│   ├── LIMITATIONS_AND_ETHICS.md
│   └── VERIFICATION.md
├── reports/
│   ├── .gitkeep
│   ├── model_comparison.json
│   ├── model_comparison.csv
│   ├── model_comparison.md
│   ├── robustness.csv
│   ├── runtime_benchmark.json
│   ├── error_table.csv
│   ├── final_results.md
│   └── private_errors/
│       └── .gitkeep
└── artifacts/
    └── gates/
        └── .gitkeep
```

---

## 12. Agent Execution Rules

For every module:

1. Create `artifacts/gates/module-<N>/`.
2. Save:
   - `commands.txt` with exact commands.
   - `stdout.txt` and `stderr.txt`.
   - `exit_codes.json`.
   - `environment.json` when hardware/software details matter.
   - Generated gate reports.
   - `summary.md` listing each gate as `PASS`, `FAIL`, or `BLOCKED_HUMAN_ACTION`.
3. Update `docs/VERIFICATION.md` with links to the evidence.
4. Do not mark a gate `PASS` without running it.
5. Do not weaken a gate because implementation failed.
6. Do not leave `TODO`, `pass`, placeholder return values, or `NotImplementedError` in code presented as complete.
7. Commit after the module passes and before starting the next module.
8. Do not push, publish, create a remote repository, or create a release without explicit human approval.
9. When a real participant, webcam, or consent action is required, stop at that gate and report the exact action needed.

---

## 13. Module 1 — Scaffolding, Configuration, Capture, and Model Assets

**Objective:** A reproducible Windows project exists with validated configuration, deterministic synthetic fixtures, camera/file capture, and verified model-asset downloading.

### Tasks

1. Create the repository tree from Section 11.
2. Initialize Git and configure `.gitignore` to exclude:
   - `.venv/`.
   - Python caches.
   - `models/runtime/*` except `.gitkeep`.
   - `data/private/**` except `.gitkeep` files.
   - Participant videos, images, annotations, and calibration profiles.
3. Create `pyproject.toml` with the stack in Section 7.
4. Create and activate a Python 3.11 virtual environment.
5. Implement typed configuration loading in `src/vigilbench/config.py` using dataclasses and PyYAML.
6. Implement `src/vigilbench/capture.py`:
   - `FrameSource(source: int | str)`.
   - Camera and video-file support.
   - Monotonic timestamps.
   - Actual FPS measurement.
   - Clear errors for unavailable source, decode failure, and unsupported resolution.
7. Implement `scripts/generate_fixtures.py` to generate a non-identifying synthetic video with changing shapes and timestamps plus synthetic landmark/feature/event fixtures.
8. Implement `models/manifest.json`, `src/vigilbench/model_assets.py`, and `scripts/download_models.py`:
   - Download the configured Face Landmarker asset.
   - Verify SHA-256.
   - Refuse an unexpected checksum.
9. Record capture-only performance on the designated laptop in `artifacts/gates/module-1/capture_baseline.json`; do not set an arbitrary integrated-pipeline threshold yet.
10. Generate `requirements-lock.txt` from the verified environment.

### Gate Checks

- [ ] `python --version` reports Python 3.11.x.
- [ ] `python -m pip install -e .` exits 0.
- [ ] `python scripts/generate_fixtures.py` creates every fixture listed in Section 11 and marks the fixture manifest `SMOKE_TEST_ONLY`.
- [ ] `pytest tests/test_capture.py tests/test_model_assets.py -q` passes.
- [ ] `python -m vigilbench capture-check --source tests/fixtures/synthetic_capture.mp4` reads the full fixture, emits strictly increasing timestamps, and reports frame count and measured FPS.
- [ ] `python scripts/download_models.py --verify` exits 0 and records the verified checksum without committing the binary model.
- [ ] A camera smoke command records the camera index, requested resolution, actual resolution, requested FPS, actual FPS, and failure reason if unavailable. Camera unavailability is `BLOCKED_HUMAN_ACTION`, not a fabricated pass.
- [ ] `artifacts/gates/module-1/capture_baseline.json` exists and contains the designated laptop CPU, RAM, OS build, camera resolution, and capture-only FPS.
- [ ] `git status --short` shows no raw/private data or model binary staged.

**Commit:** `feat(module-1): scaffold capture config and verified model assets`

---

## 14. Module 2 — Landmarks, Calibration, and Observation Quality

**Objective:** The system converts frames into calibrated, quality-labeled facial observations and fails safely when tracking is unavailable.

### Tasks

1. Implement `src/vigilbench/landmarks.py` around MediaPipe Face Landmarker video mode.
2. Return a structured observation containing timestamp, landmarks, iris availability, optional blendshapes, and face count.
3. Reject or invalidate multiple-face frames rather than choosing silently.
4. Implement `src/vigilbench/calibration.py`:
   - Guided calibration stages.
   - Minimum valid sample count per stage.
   - Robust median and dispersion statistics.
   - Calibration validity checks.
   - Anonymous session-scoped profile; no Git persistence.
5. Implement `src/vigilbench/quality.py` with the states and reason codes in Section 8.6.
6. Ensure dim-light, eye occlusion, and no-face conditions can become `DEGRADED` or `INVALID`.
7. Add a replay mode that consumes `synthetic_landmarks.json` for deterministic downstream tests.
8. Add a live diagnostic command that reports numeric quality statistics without saving raw frames by default.

### Gate Checks

- [ ] `pytest tests/test_calibration.py tests/test_quality.py -q` passes.
- [ ] Synthetic calibration with known open/closed distributions produces thresholds within the expected fixture tolerance.
- [ ] Calibration fails clearly when valid samples are below the configured minimum.
- [ ] No-face and multiple-face fixtures return `INVALID` with the correct reason code and no exception.
- [ ] A valid synthetic observation is classified `VALID`; a partial-eye fixture is `DEGRADED` or `INVALID` according to configuration.
- [ ] `python -m vigilbench live-quality-check --seconds 10` produces a numeric summary containing face-detection rate, valid-observation rate, and median landmark latency. This is a human-camera gate and may be `BLOCKED_HUMAN_ACTION` until run on the designated setup.
- [ ] No raw camera frame is written unless an explicit `--save-diagnostic-frame` flag is used.

**Commit:** `feat(module-2): calibrated landmark observations and quality handling`

---

## 15. Module 3 — Feature Extraction and Metric Correctness

**Objective:** Calibrated observations become numerically correct, timestamped drowsiness and attention-proxy features.

### Tasks

1. Implement `src/vigilbench/features.py`:
   - Left EAR.
   - Right EAR.
   - Calibrated closure fraction.
   - MAR.
   - Head yaw, pitch, and roll estimates.
   - Iris-position proxy when valid.
   - Quality masks.
2. Implement blink detection using state transitions and minimum/maximum blink duration.
3. Implement prolonged-closure detection separately from normal blink detection.
4. Implement yawn-cue detection using MAR plus persistence.
5. Implement `src/vigilbench/perclos.py` using elapsed valid time.
6. Define all landmark indices and formulas in `config/landmarks.yaml` or source comments with references.
7. Emit `None`/unavailable for invalid features rather than zero.

### Gate Checks

- [ ] `pytest tests/test_features.py tests/test_perclos.py -q` passes.
- [ ] EAR and MAR synthetic fixtures match hand-calculated reference values within `1e-3`.
- [ ] A synthetic sequence containing exactly three normal blinks produces exactly three blink events.
- [ ] A 2.5-second closure fixture produces one prolonged-closure event and is not counted as multiple blinks.
- [ ] A known timestamp sequence produces PERCLOS within one percentage point of the hand-computed value.
- [ ] Removing invalid intervals from the same sequence changes the denominator exactly as specified.
- [ ] PERCLOS is unavailable when valid coverage is below the configured minimum.
- [ ] A frontal pose fixture is within the configured synthetic tolerance; left/right/down fixtures have the correct sign and ordering.
- [ ] The attention-direction proxy is unavailable when iris and pose quality are insufficient.

**Commit:** `feat(module-3): calibrated facial features and timestamp metrics`

---

## 16. Module 4 — Deterministic Temporal Fusion and Runtime State Machine

**Objective:** A complete non-ML runtime detects sustained drowsiness and distraction cues while resisting single-frame noise and handling unavailable data safely.

### Tasks

1. Implement `src/vigilbench/temporal.py` with timestamped rolling windows.
2. Compute drowsiness risk from configurable contributions such as:
   - Prolonged closure.
   - PERCLOS.
   - Blink-duration/rate deviation.
   - Sustained yawn cue.
3. Compute distraction risk from configurable contributions such as:
   - Sustained head-away direction.
   - Sustained looking-down cue.
   - Attention-direction proxy when valid.
4. Implement persistence, hysteresis, grace periods, and cooldown.
5. Implement `src/vigilbench/states.py` using the contract in Section 8.7.
6. Implement `src/vigilbench/alerts.py` and ensure repeated alarms respect cooldown.
7. Implement a transparent decision trace showing which cues contributed to each risk score and transition.
8. Do not treat `INVALID` observations as `ALERT`.

### Gate Checks

- [ ] `pytest tests/test_temporal.py tests/test_states.py -q` passes.
- [ ] One isolated closed-eye frame does not enter `DROWSY`.
- [ ] A sustained prolonged-closure sequence enters `DROWSY` within the configured persistence interval.
- [ ] A sustained head-away sequence enters `DISTRACTED`.
- [ ] Simultaneous sustained drowsiness and distraction cues enter `DROWSY_AND_DISTRACTED`.
- [ ] Missing observations beyond the grace period enter `UNKNOWN`.
- [ ] Recovery requires the configured hysteresis interval and does not flicker between states.
- [ ] Alarm cooldown prevents duplicate alert events within the configured cooldown.
- [ ] Every state transition has a machine-readable decision trace with timestamp, previous state, next state, active cues, and quality status.

**Commit:** `feat(module-4): deterministic temporal fusion and safe state machine`

---

## 17. Module 5 — Safe Recording, Annotation, and Dataset Construction

**Objective:** The team can collect the specified pilot dataset safely, validate its metadata, annotate events, and build leakage-safe feature windows.

### Tasks

1. Write `docs/DATA_PROTOCOL.md` containing Section 9 in operational form.
2. Write `docs/LIMITATIONS_AND_ETHICS.md` containing the claims/non-claims and safety constraints.
3. Implement `scripts/record_session.py`:
   - Anonymous participant ID.
   - Glasses and lighting condition.
   - Session type.
   - Camera/setup metadata.
   - On-screen scripted prompts.
   - Event prompt timestamps.
   - Safe abort key.
4. Implement `src/vigilbench/manifest.py` and the JSON schemas in `data/schemas/`.
5. Implement `scripts/annotate_session.py` and `src/vigilbench/annotation.py` for event-boundary review.
6. Implement double-annotation comparison and agreement reporting.
7. Implement `scripts/build_dataset.py` and `src/vigilbench/dataset.py`:
   - Read validated sessions and annotations.
   - Run landmark/feature pipeline.
   - Build timestamped feature sequences.
   - Preserve participant and condition metadata.
   - Add quality masks.
   - Prevent windows from crossing session boundaries.
   - Mark output evaluation tier.
8. Implement a readiness checker that distinguishes smoke-test completeness from real-participant completeness.

### Gate Checks

- [ ] `pytest tests/test_manifest.py tests/test_annotation.py tests/test_dataset.py -q` passes.
- [ ] Invalid participant IDs, enums, missing files, impossible timestamps, and overlapping incompatible labels are rejected.
- [ ] `python scripts/build_dataset.py --manifest tests/fixtures/smoke_manifest.csv` produces a dataset marked `SMOKE_TEST_ONLY` and cannot satisfy the real-data readiness command.
- [ ] `python -m vigilbench data-readiness --tier real` fails with a clear missing-condition matrix until all 32 required sessions exist.
- [ ] After human collection, `python -m vigilbench data-readiness --tier real` reports all four participants and every glasses × lighting × session-type cell complete.
- [ ] At least 25% of event sessions have two annotations and the agreement report contains Cohen's kappa plus onset/offset disagreement.
- [ ] The agreement targets in Section 9.4 are met or the gate remains failed with the exact categories requiring re-review.
- [ ] Dataset windows include participant ID, session ID, condition labels, event labels, quality masks, timestamps, and `REAL_PARTICIPANT_EVALUATION`.
- [ ] `git status --short` confirms no private recording, annotation, feature file, consent record, or calibration profile is staged.

**Commit:** `feat(module-5): safe data collection annotation and dataset pipeline`

---

## 18. Module 6 — Baselines, GRU Challenger, and Participant-Disjoint Evaluation

**Objective:** Four models are evaluated on identical leave-one-participant-out folds, and the GRU is promoted only when it demonstrates a meaningful, safe improvement.

### Tasks

1. Implement `src/vigilbench/baselines.py`:
   - Single-frame EAR comparator.
   - Deterministic temporal system adapter.
   - Logistic-regression feature-window model.
2. Implement `src/vigilbench/gru.py`:
   - Small GRU.
   - Input features plus quality masks.
   - Three outputs or two independent risk outputs with a documented mapping to runtime states.
   - Fixed random seeds.
3. Implement `src/vigilbench/training.py`:
   - Leave-one-participant-out folds.
   - Training-only scaler fitting.
   - Training-only class weighting.
   - Checkpoint metadata.
   - No test-fold threshold tuning.
4. Implement `src/vigilbench/evaluation.py` with the metrics in Section 10.
5. Generate fold-specific prediction files so every aggregate number is traceable.
6. Generate `reports/model_comparison.json`, `reports/model_comparison.csv`, and `reports/model_comparison.md`.
7. Implement the GRU qualification decision.

### 18.1 GRU Qualification Rules

The GRU may become the runtime default only when all are true on real held-out-participant evaluation:

1. Median participant macro F1 improves over `deterministic_temporal` by at least 0.03.
2. At least three of four held-out participants do not show lower macro F1 than `deterministic_temporal`.
3. False alerts per minute do not worsen by more than 0.10 in any glasses × lighting subgroup with sufficient support.
4. Event recall for prolonged closure and head-away cues does not decrease by more than 0.05.
5. `UNKNOWN` rate does not improve merely by forcing predictions on invalid data; quality-handling rules remain identical.
6. Runtime benchmark shows the GRU path does not reduce integrated throughput by more than 20% relative to deterministic temporal inference on the same replay.

If any rule fails:

- Set `gru_status` to `NOT_QUALIFIED`.
- Keep `deterministic_temporal` as the default.
- Report the GRU results without hiding them.

### Gate Checks

- [ ] `pytest tests/test_baselines.py tests/test_gru.py tests/test_evaluation.py -q` passes.
- [ ] A GRU forward pass returns the documented output shape.
- [ ] A leakage test proves participant IDs never overlap between train and test in any fold.
- [ ] A scaler test proves no test-fold samples are used to fit normalization.
- [ ] `python scripts/train_models.py --tier smoke` completes but labels all outputs `SMOKE_TEST_ONLY`.
- [ ] `python scripts/evaluate_models.py --tier real` refuses to run until Module 5 real-data readiness passes.
- [ ] Real evaluation produces one prediction artifact per held-out participant and every required metric.
- [ ] Reports include all four models even when one performs poorly.
- [ ] `gru_status` is generated from the six qualification rules, not manually selected.
- [ ] No model is declared successful merely because metrics are non-null.

**Commit:** `feat(module-6): participant-disjoint baselines and qualified gru challenger`

---

## 19. Module 7 — Robustness, Runtime Benchmarking, and Honest Error Analysis

**Objective:** The project reports held-out robustness, event timing, observation failures, and runtime performance without hiding weak conditions.

### Tasks

1. Implement `src/vigilbench/robustness.py` using held-out predictions only.
2. Produce subgroup tables for glasses, lighting, glasses × lighting, participant, event type, and quality state.
3. Implement event matching with a documented temporal tolerance.
4. Compute false alerts per minute from continuous alert sessions.
5. Compute median and p95 detection delay from matched events.
6. Implement `src/vigilbench/benchmark.py` and `scripts/benchmark_runtime.py`:
   - Capture-only baseline.
   - Landmark latency.
   - Feature/temporal latency.
   - Deterministic end-to-end latency.
   - GRU end-to-end latency.
   - Average FPS, median latency, p95 latency, CPU, RAM, and dropped frames.
7. Derive the live-demo target from the Module 1 camera baseline:
   - `target_demo_fps = min(15, 0.70 × capture_only_fps)`.
   - Never set the target below 10 FPS without explicit supervisor approval and a documented hardware limitation.
8. Implement `src/vigilbench/reporting.py` and generate:
   - `reports/robustness.csv`.
   - `reports/runtime_benchmark.json`.
   - `reports/error_table.csv`.
   - `reports/final_results.md`.
9. The private error table must list event/session IDs, expected behavior, observed behavior, condition, quality reason, and suspected cause. It must not contain images by default.

### Gate Checks

- [ ] `pytest tests/test_robustness.py tests/test_benchmark.py -q` passes.
- [ ] Every robustness row is derived from held-out predictions and includes support count.
- [ ] All four glasses × lighting cells are present for every evaluated model or explicitly marked missing with a reason.
- [ ] False alerts are reported in alerts per minute, not only frame counts.
- [ ] Detection delay is reported in seconds with median and p95.
- [ ] Confidence intervals or per-participant ranges are present as required by Section 10.4.
- [ ] `python scripts/benchmark_runtime.py --source tests/fixtures/synthetic_capture.mp4` completes deterministically.
- [ ] A designated-camera benchmark records actual hardware and calculates `target_demo_fps` from the Module 1 baseline.
- [ ] The deterministic integrated path meets `target_demo_fps`, or the gate remains failed and the report identifies the bottleneck. Do not lower the target after seeing the result without documented human approval.
- [ ] The GRU throughput comparison required by Module 6 is recorded.
- [ ] `reports/error_table.csv` includes false positives, false negatives, `UNKNOWN` cases, and low-quality tracking cases.
- [ ] `reports/final_results.md` states the small-sample and simulated-cue limitations prominently.

**Commit:** `feat(module-7): held-out robustness runtime benchmark and error analysis`

---

## 20. Module 8 — Integrated Demo, Documentation, and Release Preparation

**Objective:** A complete local application runs from camera or replay input, exposes transparent state information, and ships with reproducible documentation without publishing anything automatically.

### Tasks

1. Implement `src/vigilbench/app.py` connecting:
   - Capture.
   - Landmark detection or replay.
   - Calibration.
   - Quality assessment.
   - Feature extraction.
   - PERCLOS and temporal metrics.
   - Selected runtime model.
   - State machine.
   - Alert and overlay.
   - Anonymous event logging.
2. Implement `src/vigilbench/overlay.py` showing:
   - Current state.
   - Drowsiness risk.
   - Distraction risk.
   - PERCLOS and valid coverage.
   - Active cues.
   - Observation quality.
   - FPS.
3. Implement `src/vigilbench/logging_io.py`:
   - Store timestamps, states, risks, quality, and event transitions.
   - Do not store raw frames by default.
4. Implement `scripts/run_demo.py`:
   - Camera or file source.
   - `--model deterministic|logistic|gru`.
   - `--headless` replay mode.
   - `--duration`.
   - `--no-audio`.
5. Implement `src/vigilbench/cli.py`, `src/vigilbench/__main__.py`, and documented commands.
6. Complete `README.md`, data protocol, limitations/ethics, and verification index.
7. Run a clean-environment rehearsal on Windows.
8. Prepare GitHub metadata and release notes, but do not push or publish without explicit human approval.

### Gate Checks

- [ ] `pytest -q` passes the full automated suite.
- [ ] `python scripts/run_demo.py --source tests/fixtures/synthetic_capture.mp4 --headless --duration 10 --model deterministic` exits 0 and writes a summary with frame count, FPS, state counts, `UNKNOWN` count, and alert count.
- [ ] Replay integration produces exactly one quality result, risk pair, and state per output timestamp.
- [ ] Live-camera calibration completes and the app runs for at least 60 seconds without an unhandled exception. This is a human-camera gate.
- [ ] The overlay visibly distinguishes `UNKNOWN` from `ALERT`.
- [ ] The default runtime model equals the Module 6 qualification result.
- [ ] Event logs contain no raw image data or personal name.
- [ ] A fresh Windows virtual environment can install from `pyproject.toml`/`requirements-lock.txt`, download verified assets, run tests, run replay inference, and generate reports.
- [ ] `README.md` includes setup, model download, calibration, demo usage, data protocol summary, evaluation commands, limitations, privacy, troubleshooting, GitHub About text, and suggested tags.
- [ ] `docs/VERIFICATION.md` links every module to its real gate evidence.
- [ ] `git status --short` contains no private participant data, model binary, or accidental absolute path.
- [ ] No remote push, deployment, or GitHub release occurs without explicit human approval.

**Commit:** `feat(module-8): integrated local demo documentation and release preparation`

---

## 21. Documentation & Release

Use "C:\Dev\readMEtemplate.md" to write the readme add git hub repo about section and tags section and security policy code of conduct, contributing, deployment and gh release, no emojis in the readME

Execution safety override: create or update the requested documentation and prepare release material, but do not push, deploy, publish, or create a GitHub release until a human explicitly approves that action.

---

## 22. Required Final Report Structure

`reports/final_results.md` must contain these sections:

1. Project objective.
2. Tested hardware and software environment.
3. Data protocol and participant count.
4. Safety and ethics controls.
5. Label definitions and annotation agreement.
6. Observation-quality and missing-data behavior.
7. Model definitions.
8. Participant-disjoint evaluation method.
9. Overall results.
10. Per-participant results.
11. Glasses and lighting results.
12. Event detection precision, recall, and delay.
13. False alerts per minute.
14. Runtime benchmark.
15. GRU qualification decision.
16. Error table summary.
17. Limitations and non-claims.
18. Recommended v2 work.

---

## 23. Definition of Done

- [ ] All eight modules have real gate evidence.
- [ ] Every automated test passes.
- [ ] Human-camera gates are completed on the designated setup.
- [ ] The real participant condition matrix is complete.
- [ ] Annotation agreement is measured and acceptable or transparently unresolved.
- [ ] Evaluation is participant-disjoint.
- [ ] Smoke-test artifacts are never presented as real results.
- [ ] Deterministic temporal fusion, logistic baseline, and GRU challenger are all reported.
- [ ] GRU runtime promotion follows the qualification rules.
- [ ] Robustness results use held-out predictions only.
- [ ] False alerts per minute and detection delay are reported.
- [ ] `UNKNOWN` and quality coverage are reported.
- [ ] The integrated local demo runs from webcam and replay input.
- [ ] The final report states that the system detects scripted visible cues, not physiological drowsiness.
- [ ] No private participant data is tracked by Git.
- [ ] README and supporting documentation are complete.
- [ ] Repository history contains one commit per completed module.
- [ ] No push, deployment, or release has occurred without explicit human approval.

---

## 24. Stop Conditions for the Autonomous Agent

Stop and report instead of guessing when:

- The designated webcam is unavailable.
- The Face Landmarker model checksum differs from the manifest.
- Consent or participant recording is required.
- The real condition matrix is incomplete.
- Annotation agreement fails after one documented revision cycle.
- A participant-disjoint split cannot be formed.
- Private data appears staged in Git.
- The integrated FPS target fails after profiling and one optimization pass.
- The user or supervisor must approve publishing, deployment, or scope expansion.

When stopped, provide:

1. The failed gate.
2. The exact command and output.
3. The evidence path.
4. The root-cause hypothesis.
5. The smallest human action needed to continue.
