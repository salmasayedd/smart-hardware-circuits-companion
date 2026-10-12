import React, { useState, useEffect } from 'react';
import { WorkspaceTab, Language, CircuitAnalysisResult, CodeDebugResult, SimulationResult, HistoryItem } from './types';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { CircuitAnalyzer } from './components/circuitAnalyzer/CircuitAnalyzer';
import { CodeDebugger } from './components/codeDebugger/CodeDebugger';
import { Calculators } from './components/calculators/Calculators';
import { CircuitSimulator } from './components/simulator/CircuitSimulator';
import { EngineeringTutor } from './components/tutor/EngineeringTutor';
import { ReportGenerator } from './components/reports/ReportGenerator';
import { HistoryManager } from './components/history/HistoryManager';
import { SettingsView } from './components/settings/SettingsView';
import { checkServerHealth } from './services/api';

export default function App() {
  // Tab & Navigation
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Internationalization: persistent Language state
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('smart_companion_lang') as Language) || 'en';
  });

  // AI Connection State
  const [isAiLive, setIsAiLive] = useState<boolean>(false);

  // Cross-module session state
  const [activeCircuitAnalysis, setActiveCircuitAnalysis] = useState<CircuitAnalysisResult | null>(null);
  const [activeCodeDebug, setActiveCodeDebug] = useState<CodeDebugResult | null>(null);
  const [activeSimulation, setActiveSimulation] = useState<SimulationResult | null>(null);

  // Check backend server status
  useEffect(() => {
    checkServerHealth().then(status => {
      setIsAiLive(status.hasGeminiKey);
    });
  }, []);

  // Update HTML document dir and language attribute
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('smart_companion_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  // Handler to send circuit results to report generator
  const handleSendCircuitToReport = (result: CircuitAnalysisResult) => {
    setActiveCircuitAnalysis(result);
    setCurrentTab('reports');
  };

  // Handler to send code debug results to report generator
  const handleSendCodeToReport = (result: CodeDebugResult) => {
    setActiveCodeDebug(result);
    setCurrentTab('reports');
  };

  // Handler to send simulation results to report generator
  const handleSendSimToReport = (sim: SimulationResult) => {
    setActiveSimulation(sim);
    setCurrentTab('reports');
  };

  // Restore session from history
  const handleRestoreSession = (item: HistoryItem) => {
    if (item.type === 'circuit') {
      setActiveCircuitAnalysis(item.data);
      setCurrentTab('circuit-analyzer');
    } else if (item.type === 'code') {
      setActiveCodeDebug(item.data);
      setCurrentTab('code-debugger');
    } else if (item.type === 'simulation') {
      setActiveSimulation(item.data);
      setCurrentTab('simulator');
    } else if (item.type === 'calculation') {
      setCurrentTab('calculators');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600/30">
      
      {/* Persistent Global Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        onToggleLanguage={toggleLanguage}
        isAiLive={isAiLive}
      />

      {/* Main Layout Area */}
      {currentTab === 'home' ? (
        <LandingPage
          onSelectTab={setCurrentTab}
          language={language}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          
          {/* Workstation Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            language={language}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          {/* Module Content Viewport */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-10 py-8 max-w-7xl mx-auto w-full">
            {currentTab === 'circuit-analyzer' && (
              <CircuitAnalyzer
                language={language}
                onSendToReport={handleSendCircuitToReport}
                savedInitialResult={activeCircuitAnalysis}
              />
            )}

            {currentTab === 'code-debugger' && (
              <CodeDebugger
                language={language}
                onSendToReport={handleSendCodeToReport}
                savedInitialResult={activeCodeDebug}
              />
            )}

            {currentTab === 'calculators' && (
              <Calculators
                language={language}
              />
            )}

            {currentTab === 'simulator' && (
              <CircuitSimulator
                language={language}
                onSendToReport={handleSendSimToReport}
              />
            )}

            {currentTab === 'tutor' && (
              <EngineeringTutor
                language={language}
                currentContext={activeCircuitAnalysis || activeCodeDebug || activeSimulation}
              />
            )}

            {currentTab === 'reports' && (
              <ReportGenerator
                language={language}
                circuitData={activeCircuitAnalysis}
                codeData={activeCodeDebug}
                simData={activeSimulation}
              />
            )}

            {currentTab === 'history' && (
              <HistoryManager
                language={language}
                onRestoreSession={handleRestoreSession}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                language={language}
                onToggleLanguage={toggleLanguage}
              />
            )}
          </main>

          {/* Mobile Bottom Quick-Access Bar (visible only on mobile) */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-2 py-2 flex items-center justify-around overflow-x-auto">
            <button
              onClick={() => setCurrentTab('home')}
              className="p-2 rounded-xl text-center flex flex-col items-center gap-1 min-w-[50px] text-slate-400 hover:text-white"
            >
              <span className="text-[10px]">🏠</span>
              <span className="text-[10px] leading-none">{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
            </button>
            <button
              onClick={() => setCurrentTab('circuit-analyzer')}
              className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 min-w-[50px] ${
                currentTab === 'circuit-analyzer' ? 'text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              <span className="text-[10px]">⚡</span>
              <span className="text-[10px] leading-none">{language === 'ar' ? 'الدوائر' : 'Circuit'}</span>
            </button>
            <button
              onClick={() => setCurrentTab('code-debugger')}
              className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 min-w-[50px] ${
                currentTab === 'code-debugger' ? 'text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              <span className="text-[10px]">💻</span>
              <span className="text-[10px] leading-none">{language === 'ar' ? 'الكود' : 'Code'}</span>
            </button>
            <button
              onClick={() => setCurrentTab('calculators')}
              className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 min-w-[50px] ${
                currentTab === 'calculators' ? 'text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              <span className="text-[10px]">🧮</span>
              <span className="text-[10px] leading-none">{language === 'ar' ? 'حاسبات' : 'Calc'}</span>
            </button>
            <button
              onClick={() => setCurrentTab('simulator')}
              className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 min-w-[50px] ${
                currentTab === 'simulator' ? 'text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              <span className="text-[10px]">▶️</span>
              <span className="text-[10px] leading-none">{language === 'ar' ? 'محاكاة' : 'Sim'}</span>
            </button>
            <button
              onClick={() => setCurrentTab('tutor')}
              className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 min-w-[50px] ${
                currentTab === 'tutor' ? 'text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              <span className="text-[10px]">🎓</span>
              <span className="text-[10px] leading-none">{language === 'ar' ? 'معلم' : 'Tutor'}</span>
            </button>
            <button
              onClick={() => setCurrentTab('reports')}
              className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 min-w-[50px] ${
                currentTab === 'reports' ? 'text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              <span className="text-[10px]">📄</span>
              <span className="text-[10px] leading-none">{language === 'ar' ? 'تقارير' : 'Reports'}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
