import React from 'react';
import { 
  Home, 
  MapPin, 
  BarChart3, 
  Settings, 
  Car,
  Video
} from 'lucide-react';

export type NavItem = 'dashboard' | 'live' | 'trips' | 'statistics' | 'settings';

interface SidebarProps {
  currentTab: NavItem;
  onTabChange: (tab: NavItem) => void;
  monitoringActive?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  monitoringActive = true,
}) => {
  const navItems = [
    { id: 'dashboard' as NavItem, label: 'Dashboard', icon: Home },
    { id: 'live' as NavItem, label: 'Live Monitor', icon: Video },
    { id: 'trips' as NavItem, label: 'Trips', icon: MapPin },
    { id: 'statistics' as NavItem, label: 'Statistics', icon: BarChart3 },
    { id: 'settings' as NavItem, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-100/90 flex flex-col justify-between p-5 pt-12 select-none h-screen fixed left-0 top-0 z-40">
      {/* Brand Header */}
      <div>
        <div className="flex items-center space-x-3 px-1 mb-8">
          <div className="w-10 h-10 rounded-xl bg-slate-100/90 flex items-center justify-center text-slate-800 shadow-sm border border-slate-200/50">
            <Car className="w-5 h-5 text-slate-900 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-bold text-[17px] text-slate-900 tracking-tight leading-tight">
              DriveSafe
            </h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-normal mt-0.5">
              Stay alert. Stay safe.
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3.5 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50/90 text-blue-600 font-semibold shadow-sm shadow-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] ${
                    isActive ? 'text-blue-600 stroke-[2.4]' : 'text-slate-400 stroke-[1.8]'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Indicator Badge */}
      <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5 flex items-start space-x-3">
        <div className="mt-1 relative flex items-center justify-center">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              monitoringActive ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          {monitoringActive && (
            <span className="absolute w-4 h-4 rounded-full bg-emerald-400 opacity-40 animate-ping" />
          )}
        </div>
        <div>
          <div className="text-[13px] font-semibold text-slate-900 leading-tight">
            {monitoringActive ? 'Monitoring' : 'Standby'}
          </div>
          <div className="text-[11px] text-slate-500 font-normal mt-0.5 leading-tight">
            {monitoringActive ? 'Detection system active' : 'Daemon offline'}
          </div>
        </div>
      </div>
    </aside>
  );
};
