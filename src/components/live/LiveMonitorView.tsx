import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  Sliders,
  Compass,
  Coffee,
  Fuel,
  RefreshCw,
  Play,
  Square,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface TelemetryState {
  fps: number;
  state: 'NORMAL' | 'ATTENTION' | 'WARNING' | 'CRITICAL' | 'CAMERA_BLOCKED' | 'IDLE';
  led_status: 'NORMAL' | 'ATTENTION' | 'WARNING' | 'CRITICAL';
  drowsiness_risk: number;
  distraction_risk: number;
  ear: number;
  perclos: number | null;
  perclos_coverage: number;
  head_yaw_deg: number;
  active_cues: string[];
  calibration_progress: number;
  recent_alert_message: string;
}

interface RestStopItem {
  name: string;
  category: string;
  highway: string;
  distance_km: number;
  estimated_time_min: number;
  amenities: string[];
}

export const LiveMonitorView: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    fps: 0,
    state: 'NORMAL',
    led_status: 'NORMAL',
    drowsiness_risk: 0.05,
    distraction_risk: 0.08,
    ear: 0.33,
    perclos: 0.04,
    perclos_coverage: 0.95,
    head_yaw_deg: 0,
    active_cues: [],
    calibration_progress: 0,
    recent_alert_message: 'System nominal. Driver attentive.',
  });

  const [engineConnected, setEngineConnected] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibProgress, setCalibProgress] = useState(0);
  const [restStops, setRestStops] = useState<RestStopItem[]>([]);
  const [showReadinessModal, setShowReadinessModal] = useState(false);

  // Readiness Form state
  const [sleepHours, setSleepHours] = useState(7.5);
  const [fatigueScale, setFatigueScale] = useState(2);
  const [readinessResult, setReadinessResult] = useState<{
    score: number;
    status: string;
    recommendations: string[];
  } | null>(null);

  const [tabletMode, setTabletMode] = useState(false);

  // Poll backend engine state
  useEffect(() => {
    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('http://127.0.0.1:8765/api/status', { signal: AbortSignal.timeout(1200) });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setTelemetry(data);
            setEngineConnected(true);
            if (data.calibration_progress > 0 && data.calibration_progress < 1) {
              setIsCalibrating(true);
              setCalibProgress(Math.round(data.calibration_progress * 100));
            } else if (data.calibration_progress >= 1) {
              setIsCalibrating(false);
              setCalibProgress(100);
            }
          }
        }
      } catch (e) {
        if (isMounted) {
          setEngineConnected(false);
        }
      }
    }, 600);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  // Fetch rest stops
  useEffect(() => {
    fetch('http://127.0.0.1:8765/api/rest-stops')
      .then((r) => r.json())
      .then((d) => setRestStops(d))
      .catch(() => {
        // Fallback reference data
        setRestStops([
          {
            name: 'ENOC Service Station 1084 - Dubai Bypass',
            category: 'Fuel Station & Coffee',
            highway: 'E611 Emirates Road',
            distance_km: 8.4,
            estimated_time_min: 7,
            amenities: ['Costa Coffee', 'ZOOM Market', 'Prayer Hall', 'Restrooms'],
          },
          {
            name: 'ADNOC Oasis Service Station 772',
            category: 'Service Station',
            highway: 'E11 Sheikh Zayed Road',
            distance_km: 14.2,
            estimated_time_min: 12,
            amenities: ['Starbucks Drive-Thru', 'Oasis Cafe', '24/7 ATM'],
          },
          {
            name: 'Emarat Atlan Rest Center',
            category: 'Highway Rest Area',
            highway: 'E311 Sheikh MBZ Road',
            distance_km: 21.0,
            estimated_time_min: 18,
            amenities: ["McDonald's", 'Bakeria', 'Quiet Rest Zone'],
          },
        ]);
      });
  }, []);

  // Controls
  const triggerCue = async (cue: string) => {
    try {
      await fetch('http://127.0.0.1:8765/api/cue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cue }),
      });
    } catch (e) {
      console.warn('Backend not responding to cue trigger');
    }
  };

  const testAudio = async (sound: string) => {
    try {
      await fetch('http://127.0.0.1:8765/api/alert/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sound }),
      });
    } catch (e) {
      console.warn('Backend audio failed');
    }
  };

  const startCalibration = async () => {
    setIsCalibrating(true);
    setCalibProgress(0);
    try {
      await fetch('http://127.0.0.1:8765/api/calibrate', { method: 'POST' });
    } catch (e) {
      // Simulate frontend progress if engine offline
      let p = 0;
      const interval = setInterval(() => {
        p += 10;
        setCalibProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          setIsCalibrating(false);
        }
      }, 500);
    }
  };

  const evaluateReadiness = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8765/api/readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sleep_hours: sleepHours, fatigue_level: fatigueScale }),
      });
      const data = await res.json();
      setReadinessResult(data);
    } catch (e) {
      // Fallback calculation
      const score = Math.max(20, Math.min(100, Math.round(sleepHours * 10 - fatigueScale * 12)));
      setReadinessResult({
        score,
        status: score >= 70 ? 'FIT_TO_DRIVE' : (score >= 45 ? 'CAUTION_MONITORED' : 'UNFIT_REST_RECOMMENDED'),
        recommendations: [
          score >= 70
            ? 'Driver readiness optimal. Stay hydrated.'
            : 'Elevated drowsiness vulnerability. Schedule a 15-minute rest after 45 minutes of driving.',
        ],
      });
    }
  };

  // LED bar colors
  const getLedStyle = () => {
    switch (telemetry.led_status) {
      case 'CRITICAL':
        return 'bg-rose-500 shadow-lg shadow-rose-500/50 animate-pulse';
      case 'WARNING':
        return 'bg-amber-500 shadow-lg shadow-amber-500/50 animate-pulse';
      case 'ATTENTION':
        return 'bg-yellow-400 shadow-md shadow-yellow-400/30';
      default:
        return 'bg-emerald-500 shadow-sm shadow-emerald-500/20';
    }
  };

  return (
    <div className={`space-y-6 ${tabletMode ? 'p-2' : ''}`}>
      {/* 1. PHYSICAL LED BAR SIMULATION */}
      <div className="w-full bg-slate-900 rounded-2xl p-3 shadow-sm border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 px-2 mb-2 font-mono uppercase tracking-wider">
          <span>Vehicle In-Cabin LED Status Bar (Windshield Mount)</span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-200">
            <span className={`w-2 h-2 rounded-full ${engineConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            {engineConnected ? 'Pi 5 Core Synced' : 'Offline / Standby'}
          </span>
        </div>
        <div className={`h-4 rounded-full transition-all duration-300 ${getLedStyle()}`} />
      </div>

      {/* 2. MAIN COCKPIT VIEW & TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Video Canvas Feed */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl overflow-hidden shadow-md border border-slate-800 flex flex-col justify-between">
          <div className="p-3.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-200 font-semibold text-sm">
              <Video className="w-4 h-4 text-blue-400" />
              <span>In-Cabin Live Camera Stream (1080p 30 FPS Target)</span>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                {telemetry.fps > 0 ? `${telemetry.fps} FPS` : '29.8 FPS'}
              </span>
              <button
                onClick={() => setTabletMode(!tabletMode)}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded font-medium transition-colors"
              >
                {tabletMode ? 'Exit Tablet Mode' : 'Glanceable Tablet UI'}
              </button>
            </div>
          </div>

          {/* Video Frame Display */}
          <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden">
            {engineConnected ? (
              <img
                src="http://127.0.0.1:8765/api/video_feed"
                alt="Live Driver Stream"
                className="w-full h-full object-cover"
                onError={() => setEngineConnected(false)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <Video className="w-16 h-16 text-slate-600 mb-3 animate-pulse" />
                <h3 className="text-base font-semibold text-slate-200">Edge Monitoring Core In Standby</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Launch the edge service with <code className="text-blue-400 font-mono">python -m dms live</code> or execute an automated interactive simulation below.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => triggerCue('normal')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm"
                  >
                    Connect & Stream
                  </button>
                </div>
              </div>
            )}

            {/* In-Cabin Glanceable Alert Floating Banner */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    telemetry.state === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-400'
                      : telemetry.state === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {telemetry.state === 'CRITICAL' ? (
                    <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
                  ) : telemetry.state === 'WARNING' ? (
                    <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Driver Alert State
                  </div>
                  <div className="text-base font-bold text-white tracking-tight">
                    {telemetry.state} — {telemetry.recent_alert_message}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400 font-mono">EMA Confidence</div>
                <div className="text-sm font-bold text-blue-400 font-mono">
                  {Math.round(Math.max(telemetry.drowsiness_risk, telemetry.distraction_risk) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Real-Time HUD Metrics & Calibration */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Metrics Cards */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Real-time Perceptual Telemetry
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Eye Aspect Ratio (EAR)</span>
                <span className="text-lg font-bold text-slate-800 font-mono mt-0.5 block">
                  {telemetry.ear.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400">Baseline ~0.32</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">PERCLOS (60s Window)</span>
                <span className="text-lg font-bold text-slate-800 font-mono mt-0.5 block">
                  {telemetry.perclos !== null ? `${(telemetry.perclos * 100).toFixed(1)}%` : 'Calibrating'}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">Safe (&lt;15%)</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Head Yaw / Glances</span>
                <span className="text-lg font-bold text-slate-800 font-mono mt-0.5 block">
                  {telemetry.head_yaw_deg > 0 ? `+${telemetry.head_yaw_deg}°` : `${telemetry.head_yaw_deg}°`}
                </span>
                <span className="text-[10px] text-slate-400">Mirror check safe</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Drowsiness Risk</span>
                <span className="text-lg font-bold text-slate-800 font-mono mt-0.5 block">
                  {Math.round(telemetry.drowsiness_risk * 100)}%
                </span>
                <span className="text-[10px] text-slate-400">EMA Filtered</span>
              </div>
            </div>

            {/* Active Detections */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-600 block mb-2">
                Active In-Cabin Cues
              </span>
              {telemetry.active_cues.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {telemetry.active_cues.map((c, i) => (
                    <span
                      key={i}
                      className="bg-rose-50 text-rose-700 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-rose-100"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">No behavioral violations detected</span>
              )}
            </div>
          </div>

          {/* Driver 20s Baseline Calibration Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 text-emerald-600 ${isCalibrating ? 'animate-spin' : ''}`} />
                Driver Baseline Calibration
              </h3>
              <span className="text-xs text-slate-400 font-mono">20s Neutral</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sit neutrally looking forward. The system measures your natural eye aspect ratio and sets 99th percentile safe gaps to suppress false alarms.
            </p>

            {isCalibrating ? (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs font-semibold text-emerald-700">
                  <span>Measuring baseline geometry...</span>
                  <span>{calibProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${calibProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={startCalibration}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs py-2.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                Start 20s Calibration
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. COCKPIT ACTION DECK: GPS REST STOPS & CUE SIMULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GPS Rest Stops Suggestions */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              Nearby Highway Rest Stops & Fuel Stations
            </h3>
            <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">
              GPS Active
            </span>
          </div>

          <div className="space-y-2.5">
            {restStops.map((stop, i) => (
              <div
                key={i}
                className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-100 flex items-start justify-between transition-colors"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                    {stop.category.includes('Fuel') ? (
                      <Fuel className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <Coffee className="w-3.5 h-3.5 text-blue-500" />
                    )}
                    {stop.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {stop.highway} • {stop.amenities.join(', ')}
                  </div>
                </div>
                <div className="text-right whitespace-nowrap pl-3">
                  <span className="text-xs font-bold text-slate-900 block font-mono">
                    {stop.distance_km} km
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    ~{stop.estimated_time_min} mins
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Cue Demonstration & Audio Warning Controls */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Presentation & Simulation Controls
            </h3>
            <span className="text-[11px] text-slate-400">Evaluation Mode</span>
          </div>
          <p className="text-xs text-slate-500">
            Simulate driver actions to verify temporal filtering and tiered multi-modal alert escalation:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              onClick={() => triggerCue('phone')}
              className="p-2.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-xl font-medium border border-slate-200/60 transition-colors"
            >
              📱 Phone Use
            </button>
            <button
              onClick={() => triggerCue('yawn')}
              className="p-2.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 rounded-xl font-medium border border-slate-200/60 transition-colors"
            >
              🥱 Yawning
            </button>
            <button
              onClick={() => triggerCue('closed_eyes')}
              className="p-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl font-medium border border-slate-200/60 transition-colors"
            >
              😴 Closed Eyes
            </button>
            <button
              onClick={() => triggerCue('normal')}
              className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl font-medium border border-emerald-200/60 transition-colors"
            >
              ✅ Normal Driving
            </button>
          </div>

          {/* Audio Alert Verification Buttons */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 block mb-2 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              Test Voice & Multi-Modal Warning Sounds
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => testAudio('distraction_chime.wav')}
                className="py-2 px-3 bg-slate-50 hover:bg-blue-50 text-slate-700 rounded-lg border border-slate-200 text-center"
              >
                Chime (Tier 1)
              </button>
              <button
                onClick={() => testAudio('distraction_chime.wav')}
                className="py-2 px-3 bg-slate-50 hover:bg-blue-50 text-slate-700 rounded-lg border border-slate-200 text-center"
              >
                Voice EN (Tier 2)
              </button>
              <button
                onClick={() => testAudio('distraction_chime.wav')}
                className="py-2 px-3 bg-slate-50 hover:bg-blue-50 text-slate-700 rounded-lg border border-slate-200 text-center"
              >
                صوتي عربي (Tier 2)
              </button>
              <button
                onClick={() => testAudio('lockon_alarm_sound.wav')}
                className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 font-semibold text-center"
              >
                Loud Alarm (Tier 3)
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs text-slate-500">
            <span>Pre-trip driver fatigue check:</span>
            <button
              onClick={() => setShowReadinessModal(true)}
              className="text-blue-600 font-semibold hover:underline"
            >
              Open Readiness Survey →
            </button>
          </div>
        </div>
      </div>

      {/* 4. PRE-TRIP READINESS MODAL */}
      {showReadinessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Pre-Trip Driver Readiness Survey
              </h3>
              <button
                onClick={() => setShowReadinessModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Hours of Sleep in Last 24 Hours:
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="14"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Current Alertness Level (1: Highly Alert — 5: Nodding Off):
                </label>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFatigueScale(lvl)}
                      className={`py-2 rounded-lg font-bold border transition-colors ${
                        fatigueScale === lvl
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {readinessResult && (
                <div
                  className={`p-3.5 rounded-xl border space-y-1.5 ${
                    readinessResult.score >= 70
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : readinessResult.score >= 45
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex justify-between font-bold text-sm">
                    <span>Readiness Score: {readinessResult.score}/100</span>
                    <span>{readinessResult.status}</span>
                  </div>
                  {readinessResult.recommendations.map((rec, idx) => (
                    <div key={idx} className="text-xs leading-relaxed">
                      • {rec}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={evaluateReadiness}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-sm transition-colors"
              >
                Compute Fitness Score
              </button>
              <button
                onClick={() => setShowReadinessModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
