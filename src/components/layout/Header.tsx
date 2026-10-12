import React from 'react';
import { 
  CircuitBoard, 
  Languages, 
  Cpu, 
  Code2, 
  Calculator, 
  Play, 
  GraduationCap, 
  FileText, 
  History as HistoryIcon,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { WorkspaceTab, Language } from '../../types';
import { translations } from '../../i18n/translations';

interface HeaderProps {
  currentTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  language: Language;
  onToggleLanguage: () => void;
  isAiLive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  language,
  onToggleLanguage,
  isAiLive
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <CircuitBoard className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white group-hover:text-blue-400 transition-colors">
                {t.appName}
              </span>
              <span className="hidden md:inline-flex px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-blue-950/80 text-blue-400 border border-blue-800/60">
                PRO-EE
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-400 truncate max-w-[280px]">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Quick Nav Bar on Desktop */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => onSelectTab('home')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'home'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {t.navHome}
          </button>
          <button
            onClick={() => onSelectTab('circuit-analyzer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'circuit-analyzer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            {t.navAnalyzer}
          </button>
          <button
            onClick={() => onSelectTab('code-debugger')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'code-debugger'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            {t.navDebugger}
          </button>
          <button
            onClick={() => onSelectTab('calculators')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'calculators'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            {t.navCalculators}
          </button>
          <button
            onClick={() => onSelectTab('simulator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'simulator'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            {t.navSimulator}
          </button>
          <button
            onClick={() => onSelectTab('tutor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'tutor'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            {t.navTutor}
          </button>
          <button
            onClick={() => onSelectTab('reports')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'reports'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            {t.navReports}
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'history'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HistoryIcon className="w-3.5 h-3.5" />
            {t.navHistory}
          </button>
        </nav>

        {/* Right side controls: Mode badge, Language switch, Primary CTA */}
        <div className="flex items-center gap-3">
          
          {/* AI Connection Status Badge */}
          <div 
            title={isAiLive ? "Gemini 3.8 Live API Ready" : "Pre-configured Engineering Benchmark Data"}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
              isAiLive
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                : 'bg-amber-950/60 text-amber-400 border-amber-800/60'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isAiLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            {isAiLive ? t.liveAiMode : t.demoMode}
          </div>

          {/* Language Switcher with Flags */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-700/80 text-white hover:border-blue-500 hover:bg-slate-800 transition-all cursor-pointer shadow-sm group"
            title={language === 'en' ? "التبديل إلى اللغة العربية" : "Switch to English"}
          >
            <span className="text-sm">{language === 'en' ? '🇪🇬' : '🇬🇧'}</span>
            <span className="font-semibold text-blue-400 group-hover:text-blue-300">
              {language === 'en' ? 'العربية (مصر)' : 'English'}
            </span>
          </button>

          {/* Start Analysis Button */}
          {currentTab === 'home' && (
            <button
              onClick={() => onSelectTab('circuit-analyzer')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-md shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.startAnalysis}</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
