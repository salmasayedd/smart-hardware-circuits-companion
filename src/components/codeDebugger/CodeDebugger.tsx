import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  FileCode,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { CodeDebugResult, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { debugCodeApi } from '../../services/api';
import { saveHistoryItem } from '../../services/history';
import { SAMPLE_CODES } from '../../data/samples';

interface CodeDebuggerProps {
  language: Language;
  onSendToReport?: (result: CodeDebugResult) => void;
  savedInitialResult?: CodeDebugResult | null;
}

export const CodeDebugger: React.FC<CodeDebuggerProps> = ({
  language,
  onSendToReport,
  savedInitialResult
}) => {
  const t = translations[language];

  // Editor states
  const [selectedLang, setSelectedLang] = useState<'c' | 'cpp' | 'python'>(savedInitialResult?.language || 'cpp');
  const [targetPlatform, setTargetPlatform] = useState<string>(savedInitialResult?.targetPlatform || 'arduino');
  const [code, setCode] = useState<string>(savedInitialResult?.originalCode || SAMPLE_CODES[0].code);
  const [errorLogs, setErrorLogs] = useState<string>(SAMPLE_CODES[0].errorLogs || '');
  const [context, setContext] = useState<string>(SAMPLE_CODES[0].context || '');

  // Analysis states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [debugResult, setDebugResult] = useState<CodeDebugResult | null>(savedInitialResult || null);
  const [activeView, setActiveView] = useState<'corrected' | 'diff' | 'original'>('corrected');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load sample code
  const loadSample = (sample: typeof SAMPLE_CODES[0]) => {
    const isAr = language === 'ar';
    setSelectedLang(sample.language);
    setTargetPlatform(sample.platform);
    setCode(sample.code);
    setErrorLogs(isAr && sample.errorLogsAr ? sample.errorLogsAr : sample.errorLogs);
    setContext(isAr && sample.contextAr ? sample.contextAr : sample.context);
  };

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    try {
      const result = await debugCodeApi({
        code,
        language: selectedLang,
        targetPlatform,
        errorLogs,
        context
      });

      setDebugResult(result);

      // Save to local history
      saveHistoryItem({
        id: result.id,
        title: `Code Debug: ${selectedLang.toUpperCase()} (${targetPlatform})`,
        type: 'code',
        summary: result.summary,
        data: result
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header & Quick Samples */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Code2 className="w-7 h-7 text-indigo-400" />
            <span>{t.codeTitle}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {t.codeSub}
          </p>
        </div>

        {/* Preset Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400">{t.loadExampleCode}:</span>
          {SAMPLE_CODES.map((s) => (
            <button
              key={s.id}
              onClick={() => loadSample(s)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              {s.platform.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Language Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['c', 'cpp', 'python'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-3 py-1 rounded-lg text-xs font-mono uppercase font-bold transition-all cursor-pointer ${
                  selectedLang === lang
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'cpp' ? 'C++' : lang}
              </button>
            ))}
          </div>

          {/* Platform Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">{t.targetPlatform}:</span>
            <select
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value)}
              className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="arduino">{language === 'ar' ? 'أردوينو Arduino (AVR / SAMD)' : 'Arduino (AVR / SAMD)'}</option>
              <option value="esp32">{language === 'ar' ? 'إي إس بي ESP32 (FreeRTOS / ESP-IDF)' : 'ESP32 (FreeRTOS / ESP-IDF)'}</option>
              <option value="stm32">{language === 'ar' ? 'إس تي إم STM32 (ARM Cortex-M / HAL)' : 'STM32 (ARM Cortex-M / HAL)'}</option>
              <option value="raspberry_pi">{language === 'ar' ? 'رازبيري باي Raspberry Pi (Linux GPIO)' : 'Raspberry Pi (Linux GPIO)'}</option>
              <option value="generic">{language === 'ar' ? 'أنظمة مدمجة عامة (Bare Metal)' : 'Generic Embedded / Bare Metal'}</option>
            </select>
          </div>
        </div>

        {/* Clear / Copy / Download actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(code, 'orig_code')}
            className="p-2 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={t.copyCode}
          >
            {copiedKey === 'orig_code' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setCode('')}
            className="p-2 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 transition-colors cursor-pointer"
            title={t.clearCode}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor & Context Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Source Code Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
            {/* Editor Top Bar */}
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span>main.{selectedLang === 'python' ? 'py' : selectedLang === 'cpp' ? 'cpp' : 'c'}</span>
              </div>
              <span>{lineCount} {language === 'ar' ? 'سطر' : 'lines'}</span>
            </div>

            {/* Code Textarea with line numbers */}
            <div className="flex bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto min-h-[380px]">
              <div className="select-none py-3 px-3 text-end text-slate-600 bg-slate-950/80 border-e border-slate-900 leading-6 shrink-0 w-12">
                {lineNumbers.map((n) => (
                  <div key={n}>{n}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                rows={Math.max(16, lineCount)}
                className="w-full py-3 px-4 bg-transparent resize-y focus:outline-none text-slate-200 font-mono text-xs leading-6 selection:bg-blue-600/30 text-start"
                placeholder={language === 'ar' ? '// أدخل أو الصق كود لغة C أو C++ أو بايثون للأنظمة المدمجة هنا...' : '// Enter or paste embedded C, C++, or Python source code here...'}
              />
            </div>
          </div>

          {/* Optional Logs & Hardware Context Accordion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <label className="block text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.errorLogs}</span>
              </label>
              <textarea
                rows={3}
                value={errorLogs}
                onChange={(e) => setErrorLogs(e.target.value)}
                placeholder={t.errorLogsPlaceholder}
                className="w-full p-2.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <label className="block text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.projectContext}</span>
              </label>
              <textarea
                rows={3}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder={t.projectContextPlaceholder}
                className="w-full p-2.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Run Analysis Button */}
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !code.trim()}
            className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              isLoading || !code.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
                <span>{t.debugging}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-indigo-200" />
                <span>{t.analyzeCode}</span>
              </>
            )}
          </button>
        </div>

        {/* Static Analysis Findings & Corrected Code (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {!debugResult ? (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-center mx-auto text-slate-400">
                <Terminal className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {t.awaitingCode}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                {t.awaitingCodeDesc}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Executive Summary Card */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-400">
                    {t.codeSummary}
                  </span>
                  {debugResult.isDemo && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800">
                      {t.demoMode}
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-200 leading-relaxed">
                  {debugResult.summary}
                </p>

                {onSendToReport && (
                  <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                    <button
                      onClick={() => onSendToReport(debugResult)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.sendToReport}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Detected Issues List */}
              {debugResult.issues?.length > 0 && (
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>{t.detectedIssues} ({debugResult.issues.length})</span>
                  </h3>

                  <div className="space-y-3">
                    {debugResult.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                          issue.severity === 'error'
                            ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                            : issue.severity === 'warning'
                            ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                            : 'bg-slate-800/40 border-slate-700/60 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <strong className="font-bold text-sm text-white">
                            {issue.title}
                          </strong>
                          <div className="flex items-center gap-2">
                            {issue.line && (
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300">
                                {language === 'ar' ? 'السطر' : 'Line'} {issue.line}
                              </span>
                            )}
                            <span className="uppercase font-mono text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-900">
                              {issue.severity}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-300">{issue.explanation}</p>
                        <div className="text-[11px] font-mono text-cyan-400 pt-1">
                          {language === 'ar' ? 'القاعدة الهندسية / المفهوم البرمجي:' : 'Rule:'} {issue.ruleOrConcept}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Corrected Code Box */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{t.correctedCode}</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(debugResult.correctedCode, 'corr_code')}
                      className="px-2.5 py-1 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'corr_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{t.copyCode}</span>
                    </button>
                    <button
                      onClick={() => downloadFile(debugResult.correctedCode, `corrected_main.${selectedLang === 'python' ? 'py' : selectedLang === 'cpp' ? 'cpp' : 'c'}`)}
                      className="px-2.5 py-1 rounded text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.downloadCode}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto max-h-96">
                  <pre className="text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap">
                    {debugResult.correctedCode}
                  </pre>
                </div>

                {/* Diff Explanation */}
                {debugResult.diffExplanation?.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-mono text-slate-400 block font-bold">
                      {t.diffExplanation}:
                    </span>
                    <ul className="space-y-2">
                      {debugResult.diffExplanation.map((diff, idx) => (
                        <li key={idx} className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-xs">
                          <strong className="text-slate-200 block text-emerald-400">{diff.change}</strong>
                          <span className="text-slate-400">{diff.reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommended Hardware Verification Tests */}
              {debugResult.suggestededTests?.length > 0 && (
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>{t.suggestedTests}</span>
                  </h3>
                  <ul className="space-y-2">
                    {debugResult.suggestededTests.map((test, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{test}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}
        </div>

      </div>

    </div>
  );
};
