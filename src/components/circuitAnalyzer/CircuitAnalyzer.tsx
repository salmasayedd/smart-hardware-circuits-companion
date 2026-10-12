import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  FileCheck, 
  Wrench, 
  Calculator, 
  Layers, 
  ArrowRight,
  Info,
  Copy,
  Check,
  Zap,
  HelpCircle
} from 'lucide-react';
import { CircuitAnalysisResult, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { analyzeCircuitApi } from '../../services/api';
import { saveHistoryItem } from '../../services/history';
import { SAMPLE_CIRCUIT_IMAGES, svgToDataUri } from '../../data/samples';

interface CircuitAnalyzerProps {
  language: Language;
  onSendToReport?: (result: CircuitAnalysisResult) => void;
  savedInitialResult?: CircuitAnalysisResult | null;
}

export const CircuitAnalyzer: React.FC<CircuitAnalyzerProps> = ({
  language,
  onSendToReport,
  savedInitialResult
}) => {
  const t = translations[language];

  // Upload state
  const [imageBase64, setImageBase64] = useState<string>(savedInitialResult?.imagePreviewUrl || '');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Context fields
  const [description, setDescription] = useState<string>(savedInitialResult?.userContext?.description || '');
  const [supplyVoltage, setSupplyVoltage] = useState<string>(savedInitialResult?.userContext?.supplyVoltage || '5.0 V');
  const [expectedBehavior, setExpectedBehavior] = useState<string>(savedInitialResult?.userContext?.expectedBehavior || '');
  const [symptoms, setSymptoms] = useState<string>(savedInitialResult?.userContext?.symptoms || '');
  const [componentValues, setComponentValues] = useState<string>(savedInitialResult?.userContext?.componentValues || '');

  // Analysis state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<CircuitAnalysisResult | null>(savedInitialResult || null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Handle file select
  const handleFile = (file: File) => {
    setFileError('');
    if (!file) return;

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setFileError('Invalid file format. Please upload PNG, JPEG, WebP, or SVG.');
      return;
    }

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setFileError('Image size exceeds 15MB limit. Please compress or resize.');
      return;
    }

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Load sample circuit
  const loadSample = (sample: typeof SAMPLE_CIRCUIT_IMAGES[0]) => {
    const dataUri = svgToDataUri(sample.svg);
    const isAr = language === 'ar';
    setImageBase64(dataUri);
    setImageFileName(isAr && sample.titleAr ? sample.titleAr : sample.title);
    setDescription(isAr && sample.descriptionAr ? sample.descriptionAr : sample.description);
    setSupplyVoltage(sample.supplyVoltage);
    setExpectedBehavior(isAr && sample.expectedBehaviorAr ? sample.expectedBehaviorAr : sample.expectedBehavior);
    setSymptoms(isAr && sample.symptomsAr ? sample.symptomsAr : sample.symptoms);
    setComponentValues(sample.componentValues);
    setFileError('');
  };

  // Trigger analysis
  const handleAnalyze = async () => {
    if (!imageBase64) {
      setFileError('Please upload a circuit image or select one of the test bench samples.');
      return;
    }

    setIsLoading(true);
    setFileError('');

    try {
      const result = await analyzeCircuitApi({
        imageBase64,
        description,
        supplyVoltage,
        expectedBehavior,
        symptoms,
        componentValues
      });

      result.imagePreviewUrl = imageBase64;
      setAnalysisResult(result);

      // Save to local history
      saveHistoryItem({
        id: result.id,
        title: description ? description.slice(0, 45) : 'Circuit Image Analysis',
        type: 'circuit',
        summary: result.summary,
        data: result
      });
    } catch (err: any) {
      console.error(err);
      setFileError(err.message || 'Analysis failed. Please check network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Module Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Zap className="w-7 h-7 text-blue-400" />
              <span>{t.analyzerTitle}</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {t.analyzerSub}
            </p>
          </div>

          {/* Quick Samples Dropdown / Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400">{t.sampleCircuits}</span>
            {SAMPLE_CIRCUIT_IMAGES.map((sample) => {
              const label = language === 'ar' && sample.titleAr ? sample.titleAr : sample.title;
              return (
                <button
                  key={sample.id}
                  onClick={() => loadSample(sample)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer truncate max-w-[220px]"
                  title={label}
                >
                  {label.split('(')[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Upload & Inputs on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Upload & Context Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Upload Drop Zone */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <label className="block text-xs font-mono font-bold uppercase text-slate-300">
              {language === 'ar' ? 'صورة المخطط أو لوحة التجارب (Breadboard)' : 'Circuit Image or Schematic Capture'}
            </label>

            {!imageBase64 ? (
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-950/20'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3 animate-bounce" />
                <p className="text-sm font-semibold text-slate-200">
                  {t.dropImage}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {t.dropSupport}
                </p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <img
                  src={imageBase64}
                  alt="Circuit preview"
                  className="w-full h-56 object-contain bg-slate-950"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-slate-950/90 backdrop-blur p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title="Replace Image"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setImageBase64('');
                      setImageFileName('');
                    }}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded transition-colors"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {imageFileName && (
                  <div className="p-2 bg-slate-900/90 border-t border-slate-800 text-[11px] font-mono text-slate-400 truncate">
                    {imageFileName}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                />
              </div>
            )}

            {fileError && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}
          </div>

          {/* Context Form Inputs */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span>{language === 'ar' ? 'سياق الدائرة ومواصفات التشغيل' : 'Circuit Operating Specifications (Optional)'}</span>
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">{t.circuitDesc}</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.circuitDescPlaceholder}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">{t.supplyVoltage}</label>
                <input
                  type="text"
                  value={supplyVoltage}
                  onChange={(e) => setSupplyVoltage(e.target.value)}
                  placeholder={t.supplyVoltagePlaceholder}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">{t.componentValues}</label>
                <input
                  type="text"
                  value={componentValues}
                  onChange={(e) => setComponentValues(e.target.value)}
                  placeholder={t.componentValuesPlaceholder}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">{t.expectedBehavior}</label>
              <input
                type="text"
                value={expectedBehavior}
                onChange={(e) => setExpectedBehavior(e.target.value)}
                placeholder={t.expectedBehaviorPlaceholder}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">{t.symptoms}</label>
              <textarea
                rows={2}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder={t.symptomsPlaceholder}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Run Button */}
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !imageBase64}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isLoading || !imageBase64
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>{t.analyzing}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>{t.analyzeButton}</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Column: Structured Results Dashboard (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!analysisResult ? (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-center mx-auto text-slate-400">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {language === 'ar' ? 'بانتظار صورة الدائرة للتحليل' : 'Awaiting Circuit Schematic for Diagnostic Run'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                {language === 'ar'
                  ? 'ارفع صورة أو اختر أحد الأمثلة المعيارية (LED أو Relay أو منظم الجهد) لبدء التحليل البصري واستخراج الأخطاء والمخاطر.'
                  : 'Upload your schematic/breadboard capture or select a test bench above to run visual component extraction, wiring verification, and safety hazard detection.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Executive Summary Card */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider font-bold text-slate-400">
                      {t.analysisSummary}
                    </span>
                    {analysisResult.isDemo && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800">
                        {t.demoMode}
                      </span>
                    )}
                  </div>

                  {/* Confidence Badge */}
                  <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold border flex items-center gap-1.5 ${
                    analysisResult.confidenceLevel === 'high'
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                      : analysisResult.confidenceLevel === 'medium'
                      ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                      : 'bg-rose-950/80 text-rose-400 border-rose-800'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>{t.confidence}: {analysisResult.confidenceLevel.toUpperCase()}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {analysisResult.summary}
                </p>

                {analysisResult.confidenceReason && (
                  <p className="text-xs text-slate-400 italic font-sans border-s-2 border-slate-700 ps-3">
                    {analysisResult.confidenceReason}
                  </p>
                )}

                {onSendToReport && (
                  <div className="pt-3 border-t border-slate-800/80 flex justify-end">
                    <button
                      onClick={() => onSendToReport(analysisResult)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{t.sendToReport}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Suspected Wiring Issues */}
              {analysisResult.suspectedWiringIssues?.length > 0 && (
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>{t.suspectedIssues}</span>
                  </h3>

                  <div className="space-y-3">
                    {analysisResult.suspectedWiringIssues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
                          issue.severity === 'critical'
                            ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                            : issue.severity === 'warning'
                            ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                            : 'bg-slate-800/50 border-slate-700/60 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <strong className="font-bold text-sm text-white flex items-center gap-2">
                            <span>#{idx + 1} {issue.title}</span>
                          </strong>
                          <span className="uppercase font-mono text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-900">
                            {issue.severity}
                          </span>
                        </div>
                        <p className="text-slate-300 font-sans">{issue.description}</p>
                        <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80 text-emerald-300 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[11px] block text-emerald-400">{t.recommendedFix}</span>
                            <span>{issue.recommendation}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Potential Electrical & Physical Risks */}
              {analysisResult.electricalRisks?.length > 0 && (
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>{t.electricalRisks}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysisResult.electricalRisks.map((risk, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{risk.title}</span>
                          <span className="text-[10px] font-mono text-rose-400 uppercase font-semibold">
                            {risk.severity} Risk
                          </span>
                        </div>
                        <p className="text-slate-400">{risk.detail}</p>
                        <div className="pt-1.5 text-slate-300 font-mono text-[11px] text-cyan-400">
                          {language === 'ar' ? 'إجراء الوقاية:' : 'Fix:'} {risk.prevention}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recognized Components Table */}
              {analysisResult.componentsRecognized?.length > 0 && (
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>{t.recognizedComponents}</span>
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-start">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-mono">
                          <th className="py-2 px-3 text-start">{language === 'ar' ? 'الرمز (Designator)' : 'Designator'}</th>
                          <th className="py-2 px-3 text-start">{language === 'ar' ? 'نوع العنصر' : 'Type / Subsystem'}</th>
                          <th className="py-2 px-3 text-start">{language === 'ar' ? 'القيمة / المعامل' : 'Value / Rating'}</th>
                          <th className="py-2 px-3 text-start">{language === 'ar' ? 'الحالة التشغيلية' : 'Status'}</th>
                          <th className="py-2 px-3 text-start">{language === 'ar' ? 'الملاحظات الهندسية' : 'Engineering Notes'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-sans">
                        {analysisResult.componentsRecognized.map((comp, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-mono font-bold text-blue-400">{comp.name}</td>
                            <td className="py-2.5 px-3 text-slate-300">{comp.type}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-200">{comp.valueOrLabel || '—'}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                                comp.status === 'nominal'
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                                  : comp.status === 'warning'
                                  ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                                  : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                              }`}>
                                {comp.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">{comp.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Governing Formulas & Derivations */}
              {analysisResult.relevantFormulas?.length > 0 && (
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-cyan-400" />
                    <span>{t.governingFormulas}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysisResult.relevantFormulas.map((form, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                        <div className="font-mono font-bold text-cyan-400 text-sm bg-slate-900/90 p-2 rounded border border-slate-800">
                          {form.formula}
                        </div>
                        <p className="text-slate-400">{form.explanation}</p>
                        {form.calculation && (
                          <p className="text-slate-300 font-mono text-[11px]">
                            Result: {form.calculation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagnostic Steps Checklist */}
              {analysisResult.diagnosticSteps?.length > 0 && (
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-emerald-400" />
                    <span>{t.diagnosticSteps}</span>
                  </h3>

                  <ul className="space-y-2">
                    {analysisResult.diagnosticSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{step}</span>
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
