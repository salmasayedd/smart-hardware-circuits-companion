import React, { useState } from 'react';
import { 
  Cpu, 
  Code2, 
  Calculator, 
  Play, 
  GraduationCap, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  ShieldCheck, 
  Terminal,
  Activity,
  Layers,
  HelpCircle,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { WorkspaceTab, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { calculateOhmsLaw, calculateLedResistor } from '../../utils/engineeringMath';

interface LandingPageProps {
  onSelectTab: (tab: WorkspaceTab) => void;
  language: Language;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectTab, language }) => {
  const t = translations[language];

  // Interactive Live Calculation Mini-Widget on Landing Page
  const [demoSupplyV, setDemoSupplyV] = useState<number>(5.0);
  const [demoLedColor, setDemoLedColor] = useState<'red' | 'green' | 'blue'>('red');
  const ledVfMap = { red: 2.0, green: 2.2, blue: 3.2 };
  const demoTargetI = 0.02; // 20mA

  const demoCalc = calculateLedResistor(demoSupplyV, ledVfMap[demoLedColor], demoTargetI);

  const featureCards = [
    {
      tab: 'circuit-analyzer' as WorkspaceTab,
      icon: Cpu,
      title: t.feature1Title,
      description: t.feature1Desc,
      tag: 'Vision AI & Diagnostics',
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400'
    },
    {
      tab: 'code-debugger' as WorkspaceTab,
      icon: Code2,
      title: t.feature2Title,
      description: t.feature2Desc,
      tag: 'C / C++ / Python',
      color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400'
    },
    {
      tab: 'calculators' as WorkspaceTab,
      icon: Calculator,
      title: t.feature3Title,
      description: t.feature3Desc,
      tag: 'Deterministic Math',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400'
    },
    {
      tab: 'simulator' as WorkspaceTab,
      icon: Play,
      title: t.feature4Title,
      description: t.feature4Desc,
      tag: 'Live Nodal Solver',
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400'
    },
    {
      tab: 'tutor' as WorkspaceTab,
      icon: GraduationCap,
      title: t.feature5Title,
      description: t.feature5Desc,
      tag: 'Pedagogical Assistant',
      color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400'
    },
    {
      tab: 'reports' as WorkspaceTab,
      icon: FileText,
      title: t.feature6Title,
      description: t.feature6Desc,
      tag: 'PDF & Lab Output',
      color: 'from-rose-500/20 to-orange-500/10 border-rose-500/30 text-rose-400'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-900">
        
        {/* Subtle Circuit Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#2563eb 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0, 16px 16px'
          }} />
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Engineering Badge & Egyptian Student Callout */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono text-blue-400 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>AI-POWERED ELECTRICAL & EMBEDDED WORKSTATION</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-950/60 via-slate-900 to-blue-950/60 border border-amber-600/30 text-[11px] font-sans text-amber-300">
              <span className="text-base">🇪🇬</span>
              <span className="font-semibold">{t.egyptianBadge}</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            {language === 'ar' ? (
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                مساعدك الذكي لتشخيص الدوائر وتصحيح الأكواد البرمجية
              </span>
            ) : (
              <span>
                Your Intelligent Companion for <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                  Circuits & Code
                </span>
              </span>
            )}
          </h1>

          {/* Description */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {t.heroDesc}
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onSelectTab('circuit-analyzer')}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>{t.startAnalysis}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('feature-cards-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all cursor-pointer"
            >
              <span>{t.exploreFeatures}</span>
            </button>
          </div>

          {/* Engineering Graphic / Interactive Live Preview Teaser */}
          <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 shadow-2xl backdrop-blur text-start">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  {language === 'ar' ? 'عرض حي: حاسبة مقاومة الـ LED الفورية' : 'Live Interactive Demo: Instant LED Limiting Resistor Engine'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                <CheckCircle2 className="w-3 h-3" />
                <span>Deterministic Math Engine</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  {language === 'ar' ? 'جهد المصدر (V_supply)' : 'Supply Voltage (V_supply)'}: <span className="text-white font-bold">{demoSupplyV} V</span>
                </label>
                <input
                  type="range"
                  min="3.3"
                  max="12.0"
                  step="0.1"
                  value={demoSupplyV}
                  onChange={(e) => setDemoSupplyV(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                  <span>3.3V (Logic)</span>
                  <span>5V (TTL)</span>
                  <span>12V (Auto)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  {language === 'ar' ? 'نوع ولون الـ LED' : 'LED Forward Voltage (V_f)'}:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['red', 'green', 'blue'] as const).map(color => (
                    <button
                      key={color}
                      onClick={() => setDemoLedColor(color)}
                      className={`px-2 py-1.5 rounded text-xs font-mono capitalize transition-all cursor-pointer ${
                        demoLedColor === color
                          ? 'bg-blue-600 text-white font-bold ring-1 ring-blue-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {color} ({ledVfMap[color]}V)
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono text-xs">
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>{language === 'ar' ? 'المقاومة النظرية' : 'Exact R'}:</span>
                  <span className="text-white">{demoCalc.calculatedResistance.toFixed(1)} Ω</span>
                </div>
                <div className="flex justify-between text-slate-300 font-bold mb-1">
                  <span>{language === 'ar' ? 'مقاومة E24 التجارية' : 'Nearest E24 Resistor'}:</span>
                  <span className="text-cyan-400 text-sm">{demoCalc.standardE24Resistance} Ω</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{language === 'ar' ? 'القدرة المبددة' : 'Power Dissipation'}:</span>
                  <span className="text-emerald-400">{(demoCalc.standardPower * 1000).toFixed(1)} mW</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span>{language === 'ar' ? 'معادلة أوم:' : 'Governing Equation:'} R = (V_supply - V_f) / I_f</span>
              <button
                onClick={() => onSelectTab('calculators')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <span>{language === 'ar' ? 'افتح كافة الحاسبات الـ 8' : 'Open all 8 Engineering Calculators'}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Cards Grid (6 Modules) */}
      <section id="feature-cards-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {language === 'ar' ? 'ستة أدوات هندسية متكاملة في محطة عمل واحدة' : 'Six Lab-Grade Modules in One Integrated Station'}
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            {language === 'ar' 
              ? 'كل أداة صُممت لتقديم حسابات دقيقة أو تصحيحات كود مثبتة أو تشخيص فيزيائي حقيقي.' 
              : 'Engineered for electrical students, embedded developers, and hardware prototyping engineers.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.tab}
                onClick={() => onSelectTab(feat.tab)}
                className={`group relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10 cursor-pointer flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feat.color} border`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                  <span>{language === 'ar' ? 'افتح الأداة' : 'Launch Module'}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {t.howItWorksTitle}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {t.howItWorksSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800 text-blue-400 flex items-center justify-center mx-auto mb-4 font-mono font-bold text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-white">{t.step1Title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t.step1Desc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center mx-auto mb-4 font-mono font-bold text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-white">{t.step2Title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t.step2Desc}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto mb-4 font-mono font-bold text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-white">{t.step3Title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Reliability Disclaimer (Section 14) */}
      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-800/50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-900/40 text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
            <strong className="block text-amber-300 font-bold mb-1">
              {t.safetyDisclaimerTitle}
            </strong>
            {t.safetyDisclaimerText}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">{t.appName}</span>
            <span>•</span>
            <span>IEEE Standard Notation & Deterministic Math</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => onSelectTab('calculators')} className="hover:text-slate-200 cursor-pointer">Calculators</button>
            <button onClick={() => onSelectTab('simulator')} className="hover:text-slate-200 cursor-pointer">Simulator</button>
            <button onClick={() => onSelectTab('code-debugger')} className="hover:text-slate-200 cursor-pointer">Debugger</button>
            <button onClick={() => onSelectTab('tutor')} className="hover:text-slate-200 cursor-pointer">Tutor</button>
            <button onClick={() => onSelectTab('reports')} className="hover:text-slate-200 cursor-pointer">Reports</button>
          </div>

          <p className="font-mono text-slate-400">
            © 2026 Smart Hardware & Circuits Companion
          </p>
        </div>
      </footer>

    </div>
  );
};
