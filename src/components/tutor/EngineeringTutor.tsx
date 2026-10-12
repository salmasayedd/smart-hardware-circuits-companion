import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  RefreshCw, 
  Calculator, 
  Zap, 
  Layers, 
  Sliders,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { TutorResponse, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { queryTutorApi } from '../../services/api';

interface EngineeringTutorProps {
  language: Language;
  currentContext?: any;
}

export const EngineeringTutor: React.FC<EngineeringTutorProps> = ({
  language,
  currentContext
}) => {
  const t = translations[language];

  // Tutor states
  const [level, setLevel] = useState<'beginner' | 'advanced'>('beginner');
  const [topic, setTopic] = useState<string>('Kirchhoff & Ohm Laws');
  const [question, setQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tutorData, setTutorData] = useState<TutorResponse | null>(null);

  // Suggested questions chips
  const suggestedQueries = language === 'ar' ? [
    'لماذا نحتاج دايود حماية (Flyback Diode) مع الأحمال الحثية مثل الريليه؟',
    'ما الفرق الفيزيائي بين التيار المتردد والمستمر في شحن المكثف؟',
    'كيف يتسبب غياب الكلمة المفتاحية volatile في أخطاء المقاطعات ISR؟',
    'اشتق معادلة مجزئ الجهد المحمّل بحمل كهربائي R_load خطوة بخطوة',
    'ما هي قاعدة الذراع الافتراضي (Virtual Ground) في المضخمات العملياتية؟'
  ] : [
    'Why is a Flyback Diode required across inductive relay coils?',
    'Explain the physical intuition behind RC time constant τ = R × C.',
    'Why does omitting the volatile qualifier break ISR flags in C/C++?',
    'Derive the loaded voltage divider equation with proof of loading error.',
    'How does transistor thermal runaway occur and how to prevent it?'
  ];

  const handleAskTutor = async (customPrompt?: string) => {
    const queryText = customPrompt || question;
    if (!queryText.trim()) return;

    setIsLoading(true);
    try {
      const res = await queryTutorApi({
        topic,
        question: queryText,
        currentAnalysis: currentContext,
        level,
        language
      });
      setTutorData(res);
      if (customPrompt) setQuestion(customPrompt);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <GraduationCap className="w-7 h-7 text-amber-400" />
          <span>{t.tutorTitle}</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t.tutorSub}
        </p>
      </div>

      {/* Control Panel: Discipline & Pedagogical Depth */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        
        {/* Pedagogical Depth Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">{t.tutorLevel}:</span>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setLevel('beginner')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                level === 'beginner'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.beginner}
            </button>
            <button
              onClick={() => setLevel('advanced')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                level === 'advanced'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.advanced}
            </button>
          </div>
        </div>

        {/* Engineering Topic Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">{t.topic}:</span>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="Ohm and Kirchhoff Circuit Laws">Ohm & Kirchhoff Laws</option>
            <option value="Transistor Switching and Saturation">BJT & MOSFET Transistors</option>
            <option value="RC Filters and Time Constants">RC Time Constants & Filters</option>
            <option value="Operational Amplifiers">Operational Amplifiers (Op-Amps)</option>
            <option value="Microcontroller Concurrency and Interrupts">ISR, Timers & Concurrency</option>
            <option value="Power Dissipation and Thermal Management">Power & Thermal Dissipation</option>
          </select>
        </div>

      </div>

      {/* Inquiry Input Box & Suggested Chips */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <label className="block text-xs font-mono font-bold uppercase text-slate-300">
          {language === 'ar' ? 'طرح استفسار أو مفهوم فيزيائي وهندسي' : 'Ask an Engineering Concept or Circuit Physics Question'}
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskTutor()}
            placeholder={t.askPrompt}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleAskTutor()}
            disabled={isLoading || !question.trim()}
            className={`px-5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              isLoading || !question.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-lg shadow-amber-600/20'
            }`}
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 rtl:rotate-180" />}
            <span>{t.askButton}</span>
          </button>
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] font-mono text-slate-400 block">
            {language === 'ar' ? 'أمثلة لأسئلة استرشادية:' : 'Suggested engineering inquiries:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAskTutor(q)}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-start"
              >
                • {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tutor Response Output */}
      {tutorData && (
        <div className="space-y-6">
          
          {/* Main Pedagogical Explanation */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>{t.explanation}</span>
              </h3>
              {tutorData.isDemo && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800">
                  {t.demoMode}
                </span>
              )}
            </div>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              {tutorData.explanation}
            </p>

            {tutorData.technicalDeepDive && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans space-y-2">
                <strong className="text-amber-400 block text-xs font-mono uppercase">
                  {t.technicalDeepDive}:
                </strong>
                <p>{tutorData.technicalDeepDive}</p>
              </div>
            )}
          </div>

          {/* Governing Laws & Principles */}
          {tutorData.fundamentalPrinciples?.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>{t.principlesLaws}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorData.fundamentalPrinciples.map((principle, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <strong className="text-sm text-white font-bold block">{principle.name}</strong>
                    <div className="p-2 rounded bg-slate-900 font-mono text-cyan-400 font-bold text-xs">
                      {principle.formula}
                    </div>
                    <p className="text-xs text-slate-400">{principle.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Derivation */}
          {tutorData.stepByStepDerivation?.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>{t.stepDerivation}</span>
              </h3>

              <ol className="space-y-2.5">
                {tutorData.stepByStepDerivation.map((step, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-200 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 text-emerald-400 flex items-center justify-center font-mono text-[11px] shrink-0">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Worked Numerical Example */}
          {tutorData.workedNumericalExample && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>{t.numericalExample}</span>
              </h3>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="text-amber-300 font-semibold">
                  PROBLEM: {tutorData.workedNumericalExample.problem}
                </div>
                <div className="space-y-1 text-slate-400 ps-3 border-s-2 border-slate-800">
                  {tutorData.workedNumericalExample.steps.map((st, idx) => (
                    <div key={idx}>• {st}</div>
                  ))}
                </div>
                <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 font-bold">
                  FINAL RESULT: {tutorData.workedNumericalExample.finalResult}
                </div>
              </div>
            </div>
          )}

          {/* Common Pitfalls & Laboratory Verification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tutorData.commonPitfalls?.length > 0 && (
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>{t.commonMistakes}</span>
                </h3>
                <ul className="space-y-2">
                  {tutorData.commonPitfalls.map((pit, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-rose-400">•</span>
                      <span>{pit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tutorData.verificationTechniques?.length > 0 && (
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-cyan-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>{t.labVerification}</span>
                </h3>
                <ul className="space-y-2">
                  {tutorData.verificationTechniques.map((tech, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-cyan-400">•</span>
                      <span>{tech}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Follow-up Prompts */}
          {tutorData.followUpQuestions?.length > 0 && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-yellow-400" />
                <span>{t.followUpPrompts}</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {tutorData.followUpQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAskTutor(q)}
                    className="px-3 py-1.5 rounded-lg text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-start"
                  >
                    ➔ {q}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
