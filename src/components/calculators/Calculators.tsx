import React, { useState } from 'react';
import { 
  Calculator, 
  Zap, 
  RotateCcw, 
  Copy, 
  Check, 
  Layers, 
  Sliders, 
  Activity, 
  ArrowRightLeft, 
  Info,
  Plus,
  Trash2,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { 
  calculateOhmsLaw, 
  calculatePower, 
  calculateSeriesResistors, 
  calculateParallelResistors, 
  calculateVoltageDivider, 
  calculateLedResistor, 
  calculateRcCircuit, 
  convertUnits,
  formatEngineeringUnits,
  UnitCategory,
  UNIT_FACTORS
} from '../../utils/engineeringMath';
import { saveHistoryItem } from '../../services/history';

interface CalculatorsProps {
  language: Language;
}

type CalcTab = 'ohms' | 'power' | 'series' | 'parallel' | 'divider' | 'led' | 'rc' | 'units';

export const Calculators: React.FC<CalculatorsProps> = ({ language }) => {
  const t = translations[language];
  const [activeCalc, setActiveCalc] = useState<CalcTab>('ohms');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyResult = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. Ohm's Law State
  const [ohmsMode, setOhmsMode] = useState<'solve_v' | 'solve_i' | 'solve_r'>('solve_v');
  const [ohmsV, setOhmsV] = useState<string>('5');
  const [ohmsI, setOhmsI] = useState<string>('0.02'); // 20mA
  const [ohmsR, setOhmsR] = useState<string>('250');
  const [ohmsResult, setOhmsResult] = useState<any>(null);
  const [ohmsError, setOhmsError] = useState<string>('');

  const runOhmsCalc = () => {
    setOhmsError('');
    try {
      if (ohmsMode === 'solve_v') {
        const iVal = parseFloat(ohmsI);
        const rVal = parseFloat(ohmsR);
        if (isNaN(iVal) || isNaN(rVal)) throw new Error('Enter valid numerical values.');
        const res = calculateOhmsLaw({ current: iVal, resistance: rVal });
        setOhmsResult(res);
        saveHistoryItem({
          title: `Ohm's Law: V = ${res.voltage}V`,
          type: 'calculation',
          summary: `Calculated V=${res.voltage}V from I=${iVal}A and R=${rVal}Ω. Power: ${res.power.toFixed(3)}W`,
          data: res
        });
      } else if (ohmsMode === 'solve_i') {
        const vVal = parseFloat(ohmsV);
        const rVal = parseFloat(ohmsR);
        if (isNaN(vVal) || isNaN(rVal)) throw new Error('Enter valid numerical values.');
        const res = calculateOhmsLaw({ voltage: vVal, resistance: rVal });
        setOhmsResult(res);
      } else {
        const vVal = parseFloat(ohmsV);
        const iVal = parseFloat(ohmsI);
        if (isNaN(vVal) || isNaN(iVal)) throw new Error('Enter valid numerical values.');
        const res = calculateOhmsLaw({ voltage: vVal, current: iVal });
        setOhmsResult(res);
      }
    } catch (e: any) {
      setOhmsError(e.message);
    }
  };

  // 2. Power State
  const [powerV, setPowerV] = useState<string>('12');
  const [powerI, setPowerI] = useState<string>('1.5');
  const [powerHours, setPowerHours] = useState<string>('24');
  const [powerResult, setPowerResult] = useState<any>(null);

  const runPowerCalc = () => {
    try {
      const v = parseFloat(powerV);
      const i = parseFloat(powerI);
      const h = parseFloat(powerHours) || 1;
      const res = calculatePower({ voltage: v, current: i, timeHours: h });
      setPowerResult(res);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // 3. Series Resistors State
  const [seriesResistors, setSeriesResistors] = useState<number[]>([100, 220, 470]);
  const [seriesV, setSeriesV] = useState<string>('12');
  const [seriesResult, setSeriesResult] = useState<any>(null);

  const runSeriesCalc = () => {
    try {
      const v = parseFloat(seriesV) || 0;
      const res = calculateSeriesResistors(seriesResistors, v);
      setSeriesResult(res);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // 4. Parallel Resistors State
  const [parallelResistors, setParallelResistors] = useState<number[]>([1000, 2000, 2000]);
  const [parallelV, setParallelV] = useState<string>('10');
  const [parallelResult, setParallelResult] = useState<any>(null);

  const runParallelCalc = () => {
    try {
      const v = parseFloat(parallelV) || 0;
      const res = calculateParallelResistors(parallelResistors, v);
      setParallelResult(res);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // 5. Voltage Divider State
  const [divVin, setDivVin] = useState<string>('5');
  const [divR1, setDivR1] = useState<string>('10000'); // 10k
  const [divR2, setDivR2] = useState<string>('10000'); // 10k
  const [divRload, setDivRload] = useState<string>('100000'); // 100k
  const [divResult, setDivResult] = useState<any>(null);

  const runDividerCalc = () => {
    try {
      const vin = parseFloat(divVin);
      const r1 = parseFloat(divR1);
      const r2 = parseFloat(divR2);
      const rload = divRload ? parseFloat(divRload) : undefined;
      const res = calculateVoltageDivider(vin, r1, r2, rload);
      setDivResult(res);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // 6. LED Limiter State
  const [ledVs, setLedVs] = useState<string>('5.0');
  const [ledVf, setLedVf] = useState<string>('2.0'); // 2.0V red
  const [ledIf, setLedIf] = useState<string>('0.02'); // 20mA
  const [ledResult, setLedResult] = useState<any>(null);

  const runLedCalc = () => {
    try {
      const vs = parseFloat(ledVs);
      const vf = parseFloat(ledVf);
      const ifA = parseFloat(ledIf);
      const res = calculateLedResistor(vs, vf, ifA);
      setLedResult(res);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // 7. RC Circuit State
  const [rcR, setRcR] = useState<string>('1000'); // 1k
  const [rcC, setRcC] = useState<string>('0.00001'); // 10uF
  const [rcVs, setRcVs] = useState<string>('10');
  const [rcTime, setRcTime] = useState<string>('0.02');
  const [rcResult, setRcResult] = useState<any>(null);

  const runRcCalc = () => {
    try {
      const r = parseFloat(rcR);
      const c = parseFloat(rcC);
      const vs = parseFloat(rcVs);
      const tQ = rcTime ? parseFloat(rcTime) : undefined;
      const res = calculateRcCircuit(r, c, vs, tQ);
      setRcResult(res);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // 8. Unit Converter State
  const [unitCategory, setUnitCategory] = useState<UnitCategory>('resistance');
  const [unitVal, setUnitVal] = useState<string>('4.7');
  const [unitFrom, setUnitFrom] = useState<string>('kΩ');
  const [unitTo, setUnitTo] = useState<string>('Ω');
  const [unitConverted, setUnitConverted] = useState<number | null>(4700);

  const handleUnitConvert = (val: string, cat: UnitCategory, from: string, to: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      setUnitConverted(null);
      return;
    }
    try {
      const res = convertUnits(num, cat, from, to);
      setUnitConverted(res);
    } catch {
      setUnitConverted(null);
    }
  };

  // Pre-run default calculations on first load
  React.useEffect(() => {
    runOhmsCalc();
    runPowerCalc();
    runSeriesCalc();
    runParallelCalc();
    runDividerCalc();
    runLedCalc();
    runRcCalc();
  }, []);

  const tabs = [
    { id: 'ohms' as CalcTab, label: t.ohmsLaw, icon: Zap },
    { id: 'power' as CalcTab, label: t.powerCalc, icon: Activity },
    { id: 'series' as CalcTab, label: t.seriesResistors, icon: Layers },
    { id: 'parallel' as CalcTab, label: t.parallelResistors, icon: Layers },
    { id: 'divider' as CalcTab, label: t.voltageDivider, icon: Sliders },
    { id: 'led' as CalcTab, label: t.ledResistor, icon: Lightbulb },
    { id: 'rc' as CalcTab, label: t.rcCircuits, icon: TrendingUp },
    { id: 'units' as CalcTab, label: t.unitConverter, icon: ArrowRightLeft },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Calculator className="w-7 h-7 text-emerald-400" />
          <span>{t.calcTitle}</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t.calcSub}
        </p>
      </div>

      {/* Calculator Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCalc === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCalc(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Active Calculator Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        
        {/* 1. OHM'S LAW */}
        {activeCalc === 'ohms' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <span>{language === 'ar' ? "حل معادلة قانون أوم (V = I × R)" : "Ohm's Law Solver (V = I × R)"}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'حدد المتغير المجهول لحساب فرق الجهد أو شدة التيار أو المقاومة والقدرة المبددة خطوة بخطوة.' : 'Select unknown variable to compute voltage, current, resistance, and dissipated power.'}
                </p>
              </div>

              {/* Mode switch */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => { setOhmsMode('solve_v'); setOhmsResult(null); }}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer ${ohmsMode === 'solve_v' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  {t.solveV}
                </button>
                <button
                  onClick={() => { setOhmsMode('solve_i'); setOhmsResult(null); }}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer ${ohmsMode === 'solve_i' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  {t.solveI}
                </button>
                <button
                  onClick={() => { setOhmsMode('solve_r'); setOhmsResult(null); }}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer ${ohmsMode === 'solve_r' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  {t.solveR}
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {ohmsMode !== 'solve_v' && (
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">{t.voltageLabel}</label>
                  <input
                    type="number"
                    step="any"
                    value={ohmsV}
                    onChange={(e) => setOhmsV(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              )}
              {ohmsMode !== 'solve_i' && (
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">{t.currentLabel}</label>
                  <input
                    type="number"
                    step="any"
                    value={ohmsI}
                    onChange={(e) => setOhmsI(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              )}
              {ohmsMode !== 'solve_r' && (
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">{t.resistanceLabel}</label>
                  <input
                    type="number"
                    step="any"
                    value={ohmsR}
                    onChange={(e) => setOhmsR(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={runOhmsCalc}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                {t.calculate}
              </button>
            </div>

            {/* Result Box */}
            {ohmsResult && (
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{language === 'ar' ? 'فرق الجهد V' : 'Voltage V'}</span>
                    <strong className="text-lg font-mono text-cyan-400">{ohmsResult.voltage.toFixed(3)} V</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{language === 'ar' ? 'شدة التيار I' : 'Current I'}</span>
                    <strong className="text-lg font-mono text-emerald-400">{formatEngineeringUnits(ohmsResult.current, 'A')}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{language === 'ar' ? 'المقاومة R' : 'Resistance R'}</span>
                    <strong className="text-lg font-mono text-amber-400">{formatEngineeringUnits(ohmsResult.resistance, 'Ω')}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{language === 'ar' ? 'القدرة المبددة P' : 'Power P'}</span>
                    <strong className="text-lg font-mono text-rose-400">{formatEngineeringUnits(ohmsResult.power, 'W')}</strong>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-900 font-mono text-xs text-slate-300">
                  <strong className="text-slate-400 block text-[11px]">{t.mathematicalSubstitution}</strong>
                  {ohmsResult.steps.map((s: string, idx: number) => (
                    <div key={idx} className="text-cyan-300">• {s}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. ELECTRICAL POWER */}
        {activeCalc === 'power' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>{language === 'ar' ? "حساب القدرة والاستهلاك الكهربائي (P = V × I)" : "Electrical Power & Energy Consumption (P = V × I)"}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">{t.voltageLabel}</label>
                <input
                  type="number"
                  value={powerV}
                  onChange={(e) => setPowerV(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">{t.currentLabel}</label>
                <input
                  type="number"
                  value={powerI}
                  onChange={(e) => setPowerI(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">{t.durationHours}</label>
                <input
                  type="number"
                  value={powerHours}
                  onChange={(e) => setPowerHours(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
            </div>

            <button
              onClick={runPowerCalc}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
            >
              {t.calculate}
            </button>

            {powerResult && (
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{t.instantaneousPower}</span>
                    <strong className="text-lg font-mono text-rose-400">{formatEngineeringUnits(powerResult.power, 'W')}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{t.energyJoules}</span>
                    <strong className="text-lg font-mono text-cyan-400">{formatEngineeringUnits(powerResult.energyJoules, 'J')}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{t.energyKWh}</span>
                    <strong className="text-lg font-mono text-emerald-400">{powerResult.energyKWh.toFixed(4)} kWh</strong>
                  </div>
                </div>

                <div className="space-y-1 font-mono text-xs text-slate-300">
                  <strong className="text-slate-400 block text-[11px]">{t.mathematicalSubstitution}</strong>
                  {powerResult.steps.map((s: string, idx: number) => (
                    <div key={idx} className="text-cyan-300">• {s}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. RESISTORS IN SERIES */}
        {activeCalc === 'series' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>{language === 'ar' ? "مقاومات موصلة على التوالي (R_total = R1 + R2 + ... + Rn)" : "Resistors in Series (R_total = R1 + R2 + ... + Rn)"}</span>
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">{language === 'ar' ? 'جهد المصدر (V)' : 'Supply Voltage (V)'}</label>
                  <input
                    type="number"
                    value={seriesV}
                    onChange={(e) => setSeriesV(e.target.value)}
                    className="w-32 px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div className="pt-5">
                  <button
                    onClick={() => setSeriesResistors([...seriesResistors, 100])}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.addResistor}</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Resistor Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {seriesResistors.map((r, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">R{idx + 1}:</span>
                    <input
                      type="number"
                      value={r}
                      onChange={(e) => {
                        const updated = [...seriesResistors];
                        updated[idx] = parseFloat(e.target.value) || 0;
                        setSeriesResistors(updated);
                      }}
                      className="w-full text-xs font-mono bg-transparent text-white focus:outline-none"
                    />
                    <span className="text-xs font-mono text-slate-500">Ω</span>
                    {seriesResistors.length > 1 && (
                      <button
                        onClick={() => setSeriesResistors(seriesResistors.filter((_, i) => i !== idx))}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={runSeriesCalc}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
            >
              {t.calculate}
            </button>

            {seriesResult && (
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{language === 'ar' ? 'المقاومة الكلية R_total' : 'Total Resistance R_total'}</span>
                    <strong className="text-lg font-mono text-amber-400">{seriesResult.rTotal.toFixed(2)} Ω</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{language === 'ar' ? 'التيار الكلي I' : 'Total Current I'}</span>
                    <strong className="text-lg font-mono text-emerald-400">{formatEngineeringUnits(seriesResult.totalCurrent, 'A')}</strong>
                  </div>
                </div>

                <div className="space-y-1 font-mono text-xs">
                  <strong className="text-slate-400 block text-[11px]">{language === 'ar' ? 'توزيع هبوط الجهد على المقاومات:' : 'VOLTAGE DROPS PER RESISTOR:'}</strong>
                  {seriesResult.voltageDrops.map((v: number, idx: number) => (
                    <div key={idx} className="flex justify-between p-2 rounded bg-slate-900/60 border border-slate-900">
                      <span>R{idx + 1} ({seriesResistors[idx]}Ω):</span>
                      <span className="text-cyan-300">{v.toFixed(3)} V ({formatEngineeringUnits(seriesResult.powerDissipations[idx], 'W')})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. RESISTORS IN PARALLEL */}
        {activeCalc === 'parallel' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>{language === 'ar' ? "مقاومات موصلة على التوازي (1 / R_eq = 1/R1 + 1/R2 + ...)" : "Resistors in Parallel (1 / R_eq = 1/R1 + 1/R2 + ...)"}</span>
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">{language === 'ar' ? 'جهد المصدر (V)' : 'Supply Voltage (V)'}</label>
                  <input
                    type="number"
                    value={parallelV}
                    onChange={(e) => setParallelV(e.target.value)}
                    className="w-32 px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div className="pt-5">
                  <button
                    onClick={() => setParallelResistors([...parallelResistors, 1000])}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.addBranch}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {parallelResistors.map((r, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">R{idx + 1}:</span>
                    <input
                      type="number"
                      value={r}
                      onChange={(e) => {
                        const updated = [...parallelResistors];
                        updated[idx] = parseFloat(e.target.value) || 1;
                        setParallelResistors(updated);
                      }}
                      className="w-full text-xs font-mono bg-transparent text-white focus:outline-none"
                    />
                    <span className="text-xs font-mono text-slate-500">Ω</span>
                    {parallelResistors.length > 1 && (
                      <button
                        onClick={() => setParallelResistors(parallelResistors.filter((_, i) => i !== idx))}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={runParallelCalc}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
            >
              {t.calculate}
            </button>

            {parallelResult && (
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[11px] font-mono text-slate-400 block">{language === 'ar' ? 'المقاومة المكافئة R_eq' : 'Equivalent Resistance R_eq'}</span>
                  <strong className="text-xl font-mono text-amber-400">{parallelResult.rEquivalent.toFixed(3)} Ω</strong>
                </div>

                <div className="space-y-1 font-mono text-xs">
                  <strong className="text-slate-400 block text-[11px]">{language === 'ar' ? 'تيارات الفروع المنفصلة:' : 'BRANCH CURRENTS:'}</strong>
                  {parallelResult.branchCurrents.map((i: number, idx: number) => (
                    <div key={idx} className="flex justify-between p-2 rounded bg-slate-900/60 border border-slate-900">
                      <span>R{idx + 1} ({parallelResistors[idx]}Ω):</span>
                      <span className="text-emerald-300">{formatEngineeringUnits(i, 'A')} ({formatEngineeringUnits(parallelResult.powerDissipations[idx], 'W')})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. VOLTAGE DIVIDER */}
        {activeCalc === 'divider' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <span>{language === 'ar' ? "مجزئ الجهد وتحليل تأثير الحمل بثيفنن" : "Voltage Divider & Thevenin Loading Analysis"}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">{language === 'ar' ? 'جهد الدخل V_in (فولت)' : 'Input Voltage V_in (V)'}</label>
                <input
                  type="number"
                  value={divVin}
                  onChange={(e) => setDivVin(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">{t.topResistor}</label>
                <input
                  type="number"
                  value={divR1}
                  onChange={(e) => setDivR1(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">{t.bottomResistor}</label>
                <input
                  type="number"
                  value={divR2}
                  onChange={(e) => setDivR2(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">{t.loadResistor}</label>
                <input
                  type="number"
                  value={divRload}
                  onChange={(e) => setDivRload(e.target.value)}
                  placeholder={language === 'ar' ? 'اختياري' : 'Optional load'}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
            </div>

            <button
              onClick={runDividerCalc}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
            >
              {t.calculate}
            </button>

            {divResult && (
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{t.unloadedVout}</span>
                    <strong className="text-lg font-mono text-cyan-400">{divResult.vOutUnloaded.toFixed(3)} V</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{t.loadedVout}</span>
                    <strong className="text-lg font-mono text-emerald-400">{divResult.vOutLoaded.toFixed(3)} V</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{t.theveninRth}</span>
                    <strong className="text-lg font-mono text-amber-400">{divResult.theveninResistance.toFixed(2)} Ω</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{t.loadingError}</span>
                    <strong className="text-lg font-mono text-rose-400">{divResult.loadingErrorPercent.toFixed(2)}%</strong>
                  </div>
                </div>

                <div className="space-y-1 font-mono text-xs text-slate-300">
                  <strong className="text-slate-400 block text-[11px]">{t.mathematicalSubstitution}</strong>
                  {divResult.steps.map((s: string, idx: number) => (
                    <div key={idx} className="text-cyan-300">• {s}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. LED LIMITING RESISTOR */}
        {activeCalc === 'led' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-emerald-400" />
              <span>{language === 'ar' ? "حساب مقاومة تحديد تيار الـ LED مع المعيار التجاري E24" : "LED Current-Limiter with Commercial E24 Standardization"}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">{language === 'ar' ? 'جهد المصدر V_supply (فولت)' : 'Supply Voltage (V)'}</label>
                <input
                  type="number"
                  value={ledVs}
                  onChange={(e) => setLedVs(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">{language === 'ar' ? 'جهد الانحياز الأمامي للدايود V_f (فولت)' : 'LED Forward Voltage V_f (V)'}</label>
                <input
                  type="number"
                  value={ledVf}
                  onChange={(e) => setLedVf(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
                <div className="flex gap-2 mt-1 text-[10px] font-mono">
                  <button onClick={() => setLedVf('2.0')} className="text-rose-400 underline">{language === 'ar' ? 'أحمر (2V)' : 'Red (2V)'}</button>
                  <button onClick={() => setLedVf('2.2')} className="text-emerald-400 underline">{language === 'ar' ? 'أخضر (2.2V)' : 'Green (2.2V)'}</button>
                  <button onClick={() => setLedVf('3.2')} className="text-blue-400 underline">{language === 'ar' ? 'أزرق (3.2V)' : 'Blue (3.2V)'}</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">{language === 'ar' ? 'التيار المستهدف I_f (أمبير، مثل 0.02 لـ 20mA)' : 'Target Current (Amps, e.g. 0.02)'}</label>
                <input
                  type="number"
                  value={ledIf}
                  onChange={(e) => setLedIf(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
            </div>

            <button
              onClick={runLedCalc}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
            >
              {t.calculate}
            </button>

            {ledResult && (
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{t.exactR}</span>
                    <strong className="text-lg font-mono text-cyan-400">{ledResult.calculatedResistance.toFixed(2)} Ω</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800">
                    <span className="text-[11px] font-mono text-emerald-300 block">{t.standardE24Resistor}</span>
                    <strong className="text-xl font-mono text-emerald-400">{ledResult.standardE24Resistance} Ω</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{t.operatingCurrent}</span>
                    <strong className="text-lg font-mono text-amber-400">{(ledResult.standardCurrent * 1000).toFixed(2)} mA</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{t.recommendedWattage}</span>
                    <strong className="text-xs font-mono text-rose-400 block mt-1">{ledResult.recommendedWattageRating}</strong>
                  </div>
                </div>

                <div className="space-y-1 font-mono text-xs text-slate-300">
                  <strong className="text-slate-400 block text-[11px]">{t.mathematicalSubstitution}</strong>
                  {ledResult.steps.map((s: string, idx: number) => (
                    <div key={idx} className="text-cyan-300">• {s}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. RC CIRCUITS */}
        {activeCalc === 'rc' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>{language === 'ar' ? "استجابة نبضة RC ومرشح الترددات المنخفضة (τ = R × C)" : "RC Transient & Low-Pass Filter (τ = R × C)"}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">{language === 'ar' ? 'المقاومة R (أوم)' : 'Resistance R (Ω)'}</label>
                <input
                  type="number"
                  value={rcR}
                  onChange={(e) => setRcR(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">{language === 'ar' ? 'السعة C (فاراد، مثال: 1e-5 لـ 10µF)' : 'Capacitance C (Farads, e.g. 1e-5 = 10µF)'}</label>
                <input
                  type="number"
                  step="any"
                  value={rcC}
                  onChange={(e) => setRcC(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">{language === 'ar' ? 'جهد قفزة المصدر V_s (فولت)' : 'Supply Step V_s (V)'}</label>
                <input
                  type="number"
                  value={rcVs}
                  onChange={(e) => setRcVs(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">{language === 'ar' ? 'الزمن المطلوب حسابه t (ثانية)' : 'Query Time t (seconds)'}</label>
                <input
                  type="number"
                  step="any"
                  value={rcTime}
                  onChange={(e) => setRcTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
            </div>

            <button
              onClick={runRcCalc}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
            >
              {t.calculate}
            </button>

            {rcResult && (
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{t.timeConstantTau}</span>
                    <strong className="text-lg font-mono text-cyan-400">{formatEngineeringUnits(rcResult.timeConstant, 's')}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{t.cutoffFrequency}</span>
                    <strong className="text-lg font-mono text-emerald-400">{formatEngineeringUnits(rcResult.cutoffFrequency, 'Hz')}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{t.maxStoredEnergy}</span>
                    <strong className="text-lg font-mono text-amber-400">{formatEngineeringUnits(rcResult.energyJoules, 'J')}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-mono text-slate-400 block">{t.vcAtQueryTime}</span>
                    <strong className="text-lg font-mono text-rose-400">{rcResult.transientAtUserTime ? `${rcResult.transientAtUserTime.voltage.toFixed(2)} V` : '—'}</strong>
                  </div>
                </div>

                <div className="space-y-1 font-mono text-xs text-slate-300">
                  <strong className="text-slate-400 block text-[11px]">{t.mathematicalSubstitution}</strong>
                  {rcResult.steps.map((s: string, idx: number) => (
                    <div key={idx} className="text-cyan-300">• {s}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 8. UNIT CONVERTER */}
        {activeCalc === 'units' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
              <span>{language === 'ar' ? "محول الوحدات الهندسية القياسية (SI Units)" : "Engineering SI Unit Converter"}</span>
            </h2>

            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
              {(['resistance', 'voltage', 'current', 'capacitance', 'inductance', 'power', 'frequency', 'time'] as UnitCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setUnitCategory(cat);
                    const units = Object.keys(UNIT_FACTORS[cat]);
                    setUnitFrom(units[0]);
                    setUnitTo(units[1] || units[0]);
                    handleUnitConvert(unitVal, cat, units[0], units[1] || units[0]);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono uppercase transition-all cursor-pointer ${
                    unitCategory === cat
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">{t.convertValue}</label>
                <input
                  type="number"
                  value={unitVal}
                  onChange={(e) => {
                    setUnitVal(e.target.value);
                    handleUnitConvert(e.target.value, unitCategory, unitFrom, unitTo);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">{t.convertFrom}</label>
                <select
                  value={unitFrom}
                  onChange={(e) => {
                    setUnitFrom(e.target.value);
                    handleUnitConvert(unitVal, unitCategory, e.target.value, unitTo);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                >
                  {Object.keys(UNIT_FACTORS[unitCategory]).map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">{t.convertTo}</label>
                <select
                  value={unitTo}
                  onChange={(e) => {
                    setUnitTo(e.target.value);
                    handleUnitConvert(unitVal, unitCategory, unitFrom, e.target.value);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                >
                  {Object.keys(UNIT_FACTORS[unitCategory]).map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {unitConverted !== null && (
              <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
                <span className="text-xs text-slate-400 block mb-1">{t.convertedResult}</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {unitVal} {unitFrom} = {unitConverted >= 1e6 || (unitConverted > 0 && unitConverted < 1e-4) ? unitConverted.toExponential(4) : unitConverted.toFixed(4)} {unitTo}
                </span>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
