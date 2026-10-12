import React from 'react';
import { 
  Home, 
  Cpu, 
  Code2, 
  Calculator, 
  Play, 
  GraduationCap, 
  FileText, 
  History, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { WorkspaceTab, Language } from '../../types';
import { translations } from '../../i18n/translations';

interface SidebarProps {
  currentTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  language: Language;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  language,
  collapsed,
  onToggleCollapse
}) => {
  const t = translations[language];

  const navItems = [
    { id: 'home' as WorkspaceTab, label: t.navHome, icon: Home },
    { id: 'circuit-analyzer' as WorkspaceTab, label: t.navAnalyzer, icon: Cpu, badge: 'AI Vision' },
    { id: 'code-debugger' as WorkspaceTab, label: t.navDebugger, icon: Code2, badge: 'C/C++/Py' },
    { id: 'calculators' as WorkspaceTab, label: t.navCalculators, icon: Calculator, badge: '8 Tools' },
    { id: 'simulator' as WorkspaceTab, label: t.navSimulator, icon: Play, badge: 'DC/RC' },
    { id: 'tutor' as WorkspaceTab, label: t.navTutor, icon: GraduationCap, badge: 'AI Tutor' },
    { id: 'reports' as WorkspaceTab, label: t.navReports, icon: FileText },
    { id: 'history' as WorkspaceTab, label: t.navHistory, icon: History },
    { id: 'settings' as WorkspaceTab, label: t.navSettings, icon: Settings },
  ];

  return (
    <aside 
      className={`relative hidden md:flex flex-col border-e border-slate-800 bg-slate-950/80 backdrop-blur transition-all duration-300 z-30 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Module Title / Station Label */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-400">
              {t.workspace}
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors mx-auto cursor-pointer"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-2 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
              }`} />
              
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between overflow-hidden text-start">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                      isActive 
                        ? 'bg-blue-950/80 text-blue-300 border-blue-700/50' 
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Specs */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/30">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
            <div className="flex justify-between items-center mb-1">
              <span>SOLVER:</span>
              <span className="text-emerald-400 font-semibold">DETERMINISTIC</span>
            </div>
            <div className="flex justify-between items-center">
              <span>AI CORE:</span>
              <span className="text-blue-400 font-semibold">GEMINI 3.8</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
