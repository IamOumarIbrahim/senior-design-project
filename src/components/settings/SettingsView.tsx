import React, { useState } from 'react';
import { 
  Database, 
  Cpu, 
  Shield, 
  Download, 
  RotateCcw, 
  Check, 
  ExternalLink,
  Lock,
  Smartphone,
  Coffee,
  Eye,
  Volume2,
  Layers,
  Sparkles
} from 'lucide-react';
import { SystemSettings } from '../../types';
import { api } from '../../services/api';

interface SettingsViewProps {
  settings: SystemSettings;
  onSettingsSaved: () => void;
  onReseedCompleted: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSettingsSaved,
  onReseedCompleted,
}) => {
  const [audioAlerts, setAudioAlerts] = useState(settings.audioAlertsEnabled ?? true);
  const [saving, setSaving] = useState(false);
  const [reseeding, setReseeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all sample and historical driving data?')) {
      setClearing(true);
      try {
        await api.clearData();
        onReseedCompleted();
        alert('All sample data and detection events have been cleared from SQLite.');
      } catch (e) {
        console.error('Clear failed:', e);
      } finally {
        setClearing(false);
      }
    }
  };

  const handleSaveAlerts = async () => {
    setSaving(true);
    try {
      await api.saveSettings({
        audioAlertsEnabled: audioAlerts,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
      onSettingsSaved();
    } catch (e) {
      console.error('Failed to save settings:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleReseed = async () => {
    if (window.confirm('Reset and re-seed the SQLite database with realistic demo data?')) {
      setReseeding(true);
      try {
        await api.reseedDatabase();
        onReseedCompleted();
        alert('Database successfully re-seeded with Sep 27, 2026 reference dataset!');
      } catch (e) {
        console.error('Reseed failed:', e);
      } finally {
        setReseeding(false);
      }
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const dataStr = await api.exportDatabase();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `drivesafe-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          System Settings
        </h3>
        <p className="text-xs text-slate-500 font-normal mt-0.5">
          Configure local database storage, monitoring integration, and detection sensitivity
        </p>
      </div>

      {/* 1. Local Database Status */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Database className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              SQLite Database Storage
            </h4>
            <span className="text-xs text-slate-400">
              Persistent local post-drive database
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/50">
            <span className="text-slate-500 font-medium">Database File:</span>
            <span className="font-mono text-slate-800 font-semibold truncate max-w-md">
              {settings.databasePath}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/50">
            <span className="text-slate-500 font-medium">Connection State:</span>
            <span className="inline-flex items-center space-x-1.5 text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Connected & Operational</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Edge Monitoring System Daemon */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Cpu className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Edge Monitoring Hardware (Raspberry Pi 5 + AI Kit)
            </h4>
            <span className="text-xs text-slate-400">
              In-cabin edge DMS unit connection status
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/50">
            <span className="text-slate-400 block mb-0.5">Device Network IP:</span>
            <span className="font-mono font-bold text-slate-800">{settings.edgeDeviceIp}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/50">
            <span className="text-slate-400 block mb-0.5">Last Sync Timestamp:</span>
            <span className="font-semibold text-slate-800">
              {new Date(settings.lastSyncTimestamp).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Trained Model & Dataset Classes */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Trained Model & Dataset Classes
              </h4>
              <span className="text-xs text-slate-400">
                5 targeted behavioral actions monitored by edge inference
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-lg">
            5 Classes Active
          </span>
        </div>

        {/* 5 Classes List */}
        <div className="space-y-2.5 pt-1">
          {[
            {
              id: 'holding_phone',
              name: '1. Holding a phone',
              category: 'Distraction',
              categoryColor: 'bg-purple-100 text-purple-700 border-purple-200',
              dotColor: '#8b5cf6',
              icon: Smartphone,
              desc: 'Holding or interacting with mobile device while driving',
            },
            {
              id: 'yawning',
              name: '2. Yawning',
              category: 'Drowsiness',
              categoryColor: 'bg-amber-100 text-amber-700 border-amber-200',
              dotColor: '#f59e0b',
              icon: Sparkles,
              desc: 'Open-mouth involuntary yawning indicating driver fatigue',
            },
            {
              id: 'hands_covering_mouth_yawning',
              name: '3. Hands covering mouth while yawning',
              category: 'Drowsiness',
              categoryColor: 'bg-orange-100 text-orange-700 border-orange-200',
              dotColor: '#ea580c',
              icon: Shield,
              desc: 'Fatigue yawning gesture with hand occluding the mouth area',
            },
            {
              id: 'drinking',
              name: '4. Drinking',
              category: 'Distraction',
              categoryColor: 'bg-cyan-100 text-cyan-700 border-cyan-200',
              dotColor: '#06b6d4',
              icon: Coffee,
              desc: 'Holding and drinking from water bottle, cup, or beverage container',
            },
            {
              id: 'looking_away',
              name: '5. Looking away',
              category: 'Distraction',
              categoryColor: 'bg-blue-100 text-blue-700 border-blue-200',
              dotColor: '#3b82f6',
              icon: Eye,
              desc: 'Head rotation or gaze deviation away from forward roadway',
            },
          ].map((cls) => {
            const Icon = cls.icon;
            return (
              <div
                key={cls.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                    style={{ borderColor: `${cls.dotColor}33`, backgroundColor: `${cls.dotColor}12` }}
                  >
                    <Icon className="w-4 h-4 stroke-[2]" style={{ color: cls.dotColor }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800">
                        {cls.name}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${cls.categoryColor}`}>
                        {cls.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {cls.desc}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-3">
                  <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Monitored</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Auditory Alert Speaker Option */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Volume2 className="w-4 h-4 text-slate-500" />
            <div>
              <span className="text-xs font-semibold text-slate-700 block">
                Auditory In-Cab Warning Alerts
              </span>
              <span className="text-[11px] text-slate-400">
                Logitech S150 USB Speakers trigger audio chime on detection
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={audioAlerts}
                onChange={(e) => setAudioAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <button
              onClick={handleSaveAlerts}
              disabled={saving}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            {savedSuccess && (
              <span className="text-[11px] text-emerald-600 font-medium">Saved</span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Data Management & Actions */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-1">
          Data Management
        </h4>
        <p className="text-xs text-slate-400 mb-4">
          Export historical logs or reset the SQLite database to the reference demo state
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{exporting ? 'Exporting...' : 'Export JSON Backup'}</span>
          </button>

          <button
            onClick={handleClearData}
            disabled={clearing}
            className="px-4 py-2 border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-2 shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>{clearing ? 'Clearing...' : 'Clear All Data'}</span>
          </button>

          <button
            onClick={handleReseed}
            disabled={reseeding}
            className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>{reseeding ? 'Resetting...' : 'Re-seed Demo Data'}</span>
          </button>
        </div>
      </div>

      {/* 5. Local Privacy Pledge */}
      <div className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-5 flex items-start space-x-3.5 text-xs text-slate-600">
        <div className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
          <Lock className="w-4 h-4 stroke-[2]" />
        </div>
        <div>
          <span className="font-bold text-slate-900 block text-[13px] mb-0.5">
            Strict Local Privacy Guarantee
          </span>
          <p className="leading-relaxed text-[12px] text-slate-500">
            All driver monitoring detections, face/head pose metadata, and trip history are stored
            strictly on your local machine in SQLite. No telemetric data or video feeds are ever sent
            to any cloud service, external servers, or third-party analytics.
          </p>
        </div>
      </div>
    </div>
  );
};
