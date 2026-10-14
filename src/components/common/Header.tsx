import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { DateFilter, DateFilterPreset } from '../../types';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  dateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Driving Overview',
  subtitle = 'Your driving safety at a glance',
  dateFilter,
  onDateFilterChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customStart, setCustomStart] = useState(dateFilter.startDate);
  const [customEnd, setCustomEnd] = useState(dateFilter.endDate);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setShowCustomPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectPreset = (preset: DateFilterPreset) => {
    const todayStr = '2026-09-27';
    let start = todayStr;
    let end = todayStr;
    let label = 'Sep 27, 2026';

    if (preset === 'today') {
      start = todayStr;
      end = todayStr;
      label = 'Sep 27, 2026';
    } else if (preset === 'yesterday') {
      start = '2026-09-26';
      end = '2026-09-26';
      label = 'Sep 26, 2026';
    } else if (preset === 'last7days') {
      start = '2026-09-21';
      end = todayStr;
      label = 'Last 7 days';
    } else if (preset === 'last30days') {
      start = '2026-08-29';
      end = todayStr;
      label = 'Last 30 days';
    } else if (preset === 'custom') {
      setShowCustomPicker(true);
      return;
    }

    onDateFilterChange({
      preset,
      startDate: start,
      endDate: end,
      label,
    });
    setDropdownOpen(false);
    setShowCustomPicker(false);
  };

  const applyCustomRange = () => {
    onDateFilterChange({
      preset: 'custom',
      startDate: customStart,
      endDate: customEnd,
      label: `${customStart} – ${customEnd}`,
    });
    setDropdownOpen(false);
    setShowCustomPicker(false);
  };

  return (
    <header className="flex items-center justify-between mb-7">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-[13.5px] text-slate-500 font-normal mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Date Selector Popover */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2.5 px-3.5 py-2 bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl shadow-xs text-[13px] font-medium text-slate-700 transition-all hover:bg-slate-50/50"
        >
          <Calendar className="w-4 h-4 text-slate-500 stroke-[1.8]" />
          <span>{dateFilter.label}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/90 rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {!showCustomPicker ? (
              <div className="space-y-0.5 text-[13px]">
                <button
                  onClick={() => selectPreset('today')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100/70 transition-colors"
                >
                  <span>Today (Sep 27, 2026)</span>
                  {dateFilter.preset === 'today' && <Check className="w-4 h-4 text-blue-600" />}
                </button>
                <button
                  onClick={() => selectPreset('yesterday')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100/70 transition-colors"
                >
                  <span>Yesterday (Sep 26, 2026)</span>
                  {dateFilter.preset === 'yesterday' && <Check className="w-4 h-4 text-blue-600" />}
                </button>
                <button
                  onClick={() => selectPreset('last7days')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100/70 transition-colors"
                >
                  <span>Last 7 days</span>
                  {dateFilter.preset === 'last7days' && <Check className="w-4 h-4 text-blue-600" />}
                </button>
                <button
                  onClick={() => selectPreset('last30days')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100/70 transition-colors"
                >
                  <span>Last 30 days</span>
                  {dateFilter.preset === 'last30days' && <Check className="w-4 h-4 text-blue-600" />}
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button
                  onClick={() => selectPreset('custom')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100/70 transition-colors"
                >
                  <span>Custom Range...</span>
                  {dateFilter.preset === 'custom' && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              </div>
            ) : (
              <div className="p-2 space-y-2 text-[12px]">
                <div className="font-semibold text-slate-800">Select Date Range</div>
                <div>
                  <label className="block text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full border border-slate-200 rounded px-2 py-1 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full border border-slate-200 rounded px-2 py-1 text-slate-800"
                  />
                </div>
                <div className="flex space-x-2 pt-1">
                  <button
                    onClick={() => setShowCustomPicker(false)}
                    className="w-1/2 py-1.5 border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={applyCustomRange}
                    className="w-1/2 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
