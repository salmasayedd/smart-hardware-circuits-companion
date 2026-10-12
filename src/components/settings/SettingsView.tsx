import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Cpu, 
  Languages, 
  ShieldCheck, 
  Trash2, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Activity, 
  GraduationCap, 
  Sliders, 
  Terminal,
  Server
} from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { clearHistory } from '../../services/history';

interface SettingsViewProps {
  language: Language;
  onToggleLanguage: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  onToggleLanguage
}) => {
  const t = translations[language];
  const [notation, setNotation] = useState<'engineering' | 'scientific'>('engineering');
  const [curriculum, setCurriculum] = useState<string>('cairo');
  const [tutorDepth, setTutorDepth] = useState<'standard' | 'rigorous'>('rigorous');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [historyCleared, setHistoryCleared] = useState<boolean>(false);

  useEffect(() => {
    const savedNotation = localStorage.getItem('smart_pref_notation');
    if (savedNotation) setNotation(savedNotation as any);

    const savedCurriculum = localStorage.getItem('smart_pref_curriculum');
    if (savedCurriculum) setCurriculum(savedCurriculum);
  }, []);

  const handleSave = () => {
    localStorage.setItem('smart_pref_notation', notation);
    localStorage.setItem('smart_pref_curriculum', curriculum);
    localStorage.setItem('smart_pref_tutor_depth', tutorDepth);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleClearHistory = () => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من مسح سجل التحليلات بالكامل؟' : 'Are you sure you want to clear all analysis and calculation history?')) {
      clearHistory();
      setHistoryCleared(true);
      setTimeout(() => setHistoryCleared(false), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-blue-500" />
            <span>{language === 'ar' ? 'إعدادات المنظومة وتفضيلات المهندس' : 'Workstation & System Settings'}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {language === 'ar' 
              ? 'تخصيص بيئة العمل الهندسية، ونظام الوحدات، وسجل الأداء، والربط بالذكاء الاصطناعي' 
              : 'Configure your engineering environment, notation systems, local storage, and AI engine telemetry.'}
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{language === 'ar' ? 'حفظ التفضيلات' : 'Save Preferences'}</span>
        </button>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-300 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">
            {language === 'ar' ? 'تم حفظ التفضيلات الهندسية بنجاح في متصفحك.' : 'Engineering workstation preferences saved successfully.'}
          </span>
        </div>
      )}

      {historyCleared && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-300 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-medium">
            {language === 'ar' ? 'تم تفريغ سجل التحليلات والمحاكاة.' : 'Analysis and simulation session history has been cleared.'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Localization & University Preset */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            <span>{language === 'ar' ? 'المنهج الأكاديمي ولغة الواجهة' : 'Academic Curriculum & Language'}</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                {language === 'ar' ? 'اللغة الحالية واتجاه الكتابة' : 'Active Language & Direction'}
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={onToggleLanguage}
                  className="flex-1 flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 transition-colors text-start cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{language === 'ar' ? '🇪🇬' : '🇬🇧'}</span>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {language === 'ar' ? 'العربية (مصر) - RTL' : 'English (Engineering Standard) - LTR'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {language === 'ar' ? 'دعم كامل للمصطلحات الهندسية والكليات المصرية' : 'International SI units and standard electrical syntax'}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-blue-400 font-semibold underline">
                    {language === 'ar' ? 'تبديل' : 'Switch'}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                {language === 'ar' ? 'المرجعية الأكاديمية (الجامعات المصرية والعالمية)' : 'Academic Engineering Syllabus Preset'}
              </label>
              <select
                value={curriculum}
                onChange={(e) => setCurriculum(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="cairo">Cairo University - Faculty of Engineering (هندسة القاهرة)</option>
                <option value="ain_shams">Ain Shams University - Faculty of Engineering (هندسة عين شمس)</option>
                <option value="alexandria">Alexandria University - Faculty of Engineering (هندسة الإسكندرية)</option>
                <option value="mansoura">Mansoura University - Electrical Dept (هندسة المنصورة)</option>
                <option value="assiut">Assiut University - Faculty of Engineering (هندسة أسيوط)</option>
                <option value="zewail">Zewail City of Science and Technology (مدينة زويل)</option>
                <option value="ejust">Egypt-Japan University of Science & Tech (E-JUST)</option>
                <option value="international">Standard IEEE / IEC International Syllabus</option>
              </select>
            </div>
          </div>
        </div>

        {/* Math & Display Preferences */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <span>{language === 'ar' ? 'طريقة عرض الحسابات الهندسية' : 'Engineering Calculations & Units'}</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                {language === 'ar' ? 'صيغة الترميز الرقمي' : 'Numerical Notation Format'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNotation('engineering')}
                  className={`p-3 rounded-xl border text-xs font-medium text-start transition-all cursor-pointer ${
                    notation === 'engineering'
                      ? 'bg-blue-600/15 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-semibold text-white">Engineering Prefixes</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">10.0 kΩ, 4.70 µF, 22.0 mA</div>
                </button>
                <button
                  type="button"
                  onClick={() => setNotation('scientific')}
                  className={`p-3 rounded-xl border text-xs font-medium text-start transition-all cursor-pointer ${
                    notation === 'scientific'
                      ? 'bg-blue-600/15 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-semibold text-white">Scientific E-Notation</div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">1.00e+4 Ω, 4.70e-6 F</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                {language === 'ar' ? 'عمق الشرح في المعلم الهندسي' : 'Tutor Pedagogical Derivation Depth'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTutorDepth('standard')}
                  className={`p-3 rounded-xl border text-xs font-medium text-start transition-all cursor-pointer ${
                    tutorDepth === 'standard'
                      ? 'bg-blue-600/15 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-semibold text-white">{language === 'ar' ? 'مبسط وسريع' : 'Standard Practical'}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{language === 'ar' ? 'تركيز على الحل المباشر' : 'Direct practical equations'}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTutorDepth('rigorous')}
                  className={`p-3 rounded-xl border text-xs font-medium text-start transition-all cursor-pointer ${
                    tutorDepth === 'rigorous'
                      ? 'bg-blue-600/15 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-semibold text-white">{language === 'ar' ? 'أكاديمي استنتاجي' : 'Rigorous Derivations'}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{language === 'ar' ? 'إثباتات رياضية وفيزيائية كاملة' : 'Full step-by-step calculus & laws'}</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI & Solver Architecture */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <span>{language === 'ar' ? 'معمارية المعالجة والذكاء الاصطناعي' : 'AI & Backend Telemetry'}</span>
          </h2>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Vision & Code Model:</span>
              <span className="text-blue-400 font-semibold">Gemini 3.8 Flash</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Circuit Calculations:</span>
              <span className="text-emerald-400 font-semibold">Deterministic Node Engine</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Backend Host:</span>
              <span className="text-slate-300">Express + Vite (Port 3000)</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Demo Benchmarks:</span>
              <span className="text-slate-300">Curated Lab Verified Datasets</span>
            </div>
          </div>
        </div>

        {/* Data Storage & Reset */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>{language === 'ar' ? 'إدارة السجل والبيانات المخزنة' : 'Local Storage & Data Reset'}</span>
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'ar'
              ? 'تُحفظ جلسات التحليل والمحاكاة وكود الفيرموير محلياً داخل متصفحك للحفاظ على خصوصية أبحاثك ومشاريع تخرجك.'
              : 'Analysis runs, simulated designs, and firmware scripts are retained in your browser local storage for complete engineering privacy.'}
          </p>

          <div className="pt-2">
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{language === 'ar' ? 'مسح كافة سجلات التحليل' : 'Clear All Local History'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
