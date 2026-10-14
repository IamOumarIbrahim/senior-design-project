import React from 'react';
import { api } from '../../services/api';

export const TitleBar: React.FC = () => {
  return (
    <div className="h-9 w-full bg-white/80 backdrop-blur-sm border-b border-slate-100 flex items-center justify-between px-4 select-none titlebar-drag z-50 fixed top-0 left-0 right-0">
      {/* macOS Traffic Light Buttons */}
      <div className="flex items-center space-x-2 titlebar-no-drag">
        <button
          onClick={() => api.closeWindow()}
          title="Close"
          className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:brightness-90 transition-all flex items-center justify-center group"
        >
          <span className="opacity-0 group-hover:opacity-100 text-[8px] text-[#701511] font-bold leading-none">✕</span>
        </button>
        <button
          onClick={() => api.minimizeWindow()}
          title="Minimize"
          className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:brightness-90 transition-all flex items-center justify-center group"
        >
          <span className="opacity-0 group-hover:opacity-100 text-[9px] text-[#785208] font-bold leading-none font-mono">−</span>
        </button>
        <button
          onClick={() => api.maximizeWindow()}
          title="Maximize"
          className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] hover:brightness-90 transition-all flex items-center justify-center group"
        >
          <span className="opacity-0 group-hover:opacity-100 text-[8px] text-[#0d5918] font-bold leading-none">+</span>
        </button>
      </div>

      {/* Subtle window title */}
      <div className="text-[11px] font-medium text-slate-400 tracking-wide pointer-events-none">
        DriveSafe Desktop
      </div>

      <div className="w-14" />
    </div>
  );
};
