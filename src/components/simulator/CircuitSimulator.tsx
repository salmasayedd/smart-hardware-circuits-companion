import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Sliders, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Plus, 
  Trash2, 
  FileCheck, 
  Info,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SimulatorComponent, SimulationResult, Language } from '../../types';
import { translations } from '../../i18n/translations';
import { solveCircuit } from '../../utils/circuitSolver';
import { formatEngineeringUnits } from '../../utils/engineeringMath';
import { saveHistoryItem } from '../../services/history';

interface CircuitSimulatorProps {
  language: Language;
  onSendToReport?: (sim: SimulationResult) => void;
}

export const CircuitSimulator: React.FC<CircuitSimulatorProps> = ({
  language,
  onSendToReport
}) => {
  const t = translations[language];

  // Selected Topology
  const [topology, setTopology] = useState<'series' | 'parallel' | 'series_parallel' | 'voltage_divider' | 'rc_transient'>('series');
  const [supplyVoltage, setSupplyVoltage] = useState<number>(12);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);

  // Component states
  const [components, setComponents] = useState<SimulatorComponent[]>([
    { id: 'v1', type: 'voltage_source', designator: 'V1', value: 12, unitLabel: 'V' },
    { id: 'r1', type: 'resistor', designator: 'R1', value: 220, unitLabel: 'Ω', maxPowerRating: 0.25 },
    { id: 'r2', type: 'resistor', designator: 'R2', value: 330, unitLabel: 'Ω', maxPowerRating: 0.25 },
    { id: 'r3', type: 'resistor', designator: 'R3', value: 470, unitLabel: 'Ω', maxPowerRating: 0.25 }
  ]);

  const [simResult, setSimResult] = useState<SimulationResult | null>(null);

  // Switch topologies with appropriate pre-loaded components
  const handleSelectTopology = (newTop: typeof topology) => {
    setTopology(newTop);
    setSelectedCompId(null);

    if (newTop === 'series') {
      setComponents([
        { id: 'v1', type: 'voltage_source', designator: 'V1', value: supplyVoltage, unitLabel: 'V' },
        { id: 'r1', type: 'resistor', designator: 'R1', value: 100, unitLabel: 'Ω', maxPowerRating: 0.25 },
        { id: 'r2', type: 'resistor', designator: 'R2', value: 220, unitLabel: 'Ω', maxPowerRating: 0.25 },
        { id: 'r3', type: 'resistor', designator: 'R3', value: 470, unitLabel: 'Ω', maxPowerRating: 0.25 }
      ]);
    } else if (newTop === 'parallel') {
      setComponents([
        { id: 'v1', type: 'voltage_source', designator: 'V1', value: supplyVoltage, unitLabel: 'V' },
        { id: 'r1', type: 'resistor', designator: 'R1', value: 1000, unitLabel: 'Ω', maxPowerRating: 0.25 },
        { id: 'r2', type: 'resistor', designator: 'R2', value: 2200, unitLabel: 'Ω', maxPowerRating: 0.25 },
        { id: 'r3', type: 'resistor', designator: 'R3', value: 4700, unitLabel: 'Ω', maxPowerRating: 0.25 }
      ]);
    } else if (newTop === 'series_parallel') {
      setComponents([
        { id: 'v1', type: 'voltage_source', designator: 'V1', value: supplyVoltage, unitLabel: 'V' },
        { id: 'r1', type: 'resistor', designator: 'R1', value: 100, unitLabel: 'Ω', maxPowerRating: 0.25 },
        { id: 'r2', type: 'resistor', designator: 'R2', value: 200, unitLabel: 'Ω', maxPowerRating: 0.25 },
        { id: 'r3', type: 'resistor', designator: 'R3', value: 200, unitLabel: 'Ω', maxPowerRating: 0.25 },
        { id: 'r4', type: 'resistor', designator: 'R4', value: 50, unitLabel: 'Ω', maxPowerRating: 0.25 }
      ]);
    } else if (newTop === 'voltage_divider') {
      setComponents([
        { id: 'v1', type: 'voltage_source', designator: 'V1', value: supplyVoltage, unitLabel: 'V' },
        { id: 'r1', type: 'resistor', designator: 'R1', value: 10000, unitLabel: 'Ω', maxPowerRating: 0.25 },
        { id: 'r2', type: 'resistor', designator: 'R2', value: 10000, unitLabel: 'Ω', maxPowerRating: 0.25 }
      ]);
    } else if (newTop === 'rc_transient') {
      setComponents([
        { id: 'v1', type: 'voltage_source', designator: 'V1', value: supplyVoltage, unitLabel: 'V' },
        { id: 'r1', type: 'resistor', designator: 'R1', value: 1000, unitLabel: 'Ω', maxPowerRating: 0.25 },
        { id: 'c1', type: 'capacitor', designator: 'C1', value: 0.00001, unitLabel: 'F' }
      ]);
    }
  };

  // Run simulation calculation
  const runSimulation = () => {
    const res = solveCircuit(topology, supplyVoltage, components);
    setSimResult(res);

    // Save to history
    saveHistoryItem({
      title: `Circuit Sim: ${topology.replace('_', ' ').toUpperCase()}`,
      type: 'simulation',
      summary: `Solved ${topology} circuit. V_s=${supplyVoltage}V, R_eq=${res.equivalentResistance.toFixed(1)}Ω, I_tot=${formatEngineeringUnits(res.totalCurrent, 'A')}, P_tot=${formatEngineeringUnits(res.totalPower, 'W')}`,
      data: res
    });
  };

  useEffect(() => {
    runSimulation();
  }, [topology, supplyVoltage, components]);

  // Update a component value
  const updateComponentValue = (id: string, newVal: number) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, value: newVal } : c));
  };

  // Add a resistor (for series or parallel)
  const addResistor = () => {
    const rCount = components.filter(c => c.type === 'resistor').length + 1;
    const newComp: SimulatorComponent = {
      id: `r${Date.now()}`,
      type: 'resistor',
      designator: `R${rCount}`,
      value: 1000,
      unitLabel: 'Ω',
      maxPowerRating: 0.25
    };
    setComponents(prev => [...prev, newComp]);
  };

  // Remove a resistor
  const removeResistor = (id: string) => {
    if (components.filter(c => c.type === 'resistor').length <= 1) return;
    setComponents(prev => prev.filter(c => c.id !== id));
  };

  const selectedComponent = components.find(c => c.id === selectedCompId);
  const selectedResultComp = simResult?.components.find(c => c.id === selectedCompId);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Play className="w-7 h-7 text-cyan-400" />
            <span>{t.simTitle}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {t.simSub}
          </p>
        </div>

        {onSendToReport && simResult && (
          <button
            onClick={() => onSendToReport(simResult)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>{t.sendToReport}</span>
          </button>
        )}
      </div>

      {/* Topologies Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400">{t.topology}:</span>
          {[
            { id: 'series' as const, label: t.seriesLoop },
            { id: 'parallel' as const, label: t.parallelBranches },
            { id: 'series_parallel' as const, label: t.ladderNetwork },
            { id: 'voltage_divider' as const, label: t.dividerNetwork },
            { id: 'rc_transient' as const, label: t.rcTransientNetwork },
          ].map(top => (
            <button
              key={top.id}
              onClick={() => handleSelectTopology(top.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                topology === top.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {top.label}
            </button>
          ))}
        </div>

        {/* Global Supply Voltage */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">{t.supplyVoltageLabel}:</span>
          <input
            type="number"
            step="0.5"
            value={supplyVoltage}
            onChange={(e) => setSupplyVoltage(parseFloat(e.target.value) || 0)}
            className="w-20 px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Main Simulation View: Schematic Canvas (Left) & Telemetry Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Schematic Canvas & Wiring Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl relative min-h-[420px] flex flex-col justify-between overflow-hidden">
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-bold uppercase">{topology.replace('_', ' ')} DC ENGINE</span>
              </div>
              <div className="flex items-center gap-2">
                {(topology === 'series' || topology === 'parallel') && (
                  <button
                    onClick={addResistor}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Resistor</span>
                  </button>
                )}
              </div>
            </div>

            {/* Visual Schematic Diagram Representation */}
            <div className="py-8 flex items-center justify-center">
              
              {/* Dynamic Schematic Visuals based on Topology */}
              {topology === 'series' && (
                <div className="w-full max-w-lg p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-6">
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-400 px-2">
                    <span>VCC: +{supplyVoltage}V</span>
                    <span className="text-slate-400">Current Flow: I = {simResult ? formatEngineeringUnits(simResult.totalCurrent, 'A') : '...'} ➔</span>
                    <span>GND: 0V</span>
                  </div>

                  {/* Wire Track */}
                  <div className="flex items-center gap-3 overflow-x-auto py-4">
                    {/* Source */}
                    <div className="p-3 rounded-xl bg-slate-900 border-2 border-cyan-500/80 text-center shrink-0 w-24">
                      <Zap className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                      <div className="text-xs font-mono font-bold text-white">V1</div>
                      <div className="text-[10px] font-mono text-cyan-400">{supplyVoltage} V</div>
                    </div>

                    <div className="w-6 h-0.5 bg-cyan-400 shrink-0" />

                    {/* Resistors */}
                    {components.filter(c => c.type === 'resistor').map((comp, idx) => {
                      const resComp = simResult?.components.find(c => c.id === comp.id);
                      const isSelected = selectedCompId === comp.id;
                      const isOver = resComp?.status === 'overpower';

                      return (
                        <React.Fragment key={comp.id}>
                          <div
                            onClick={() => setSelectedCompId(comp.id)}
                            className={`p-3 rounded-xl border-2 transition-all cursor-pointer shrink-0 w-28 text-center ${
                              isSelected
                                ? 'border-cyan-400 bg-cyan-950/40 shadow-lg'
                                : isOver
                                ? 'border-rose-500 bg-rose-950/40 animate-pulse'
                                : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                            }`}
                          >
                            <div className="text-xs font-mono font-bold text-white">{comp.designator}</div>
                            <div className="text-[11px] font-mono text-amber-400">{comp.value} Ω</div>
                            <div className="text-[9px] font-mono text-slate-400 mt-1">
                              ΔV: {resComp?.voltageDrop ? `${resComp.voltageDrop.toFixed(2)}V` : '—'}
                            </div>
                          </div>
                          {idx < components.filter(c => c.type === 'resistor').length - 1 && (
                            <div className="w-6 h-0.5 bg-cyan-400 shrink-0" />
                          )}
                        </React.Fragment>
                      );
                    })}

                    <div className="w-6 h-0.5 bg-cyan-400 shrink-0" />

                    {/* GND */}
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-center shrink-0 w-16">
                      <div className="text-xs font-mono font-bold text-slate-300">GND</div>
                      <div className="text-[10px] font-mono text-slate-500">0.0V</div>
                    </div>
                  </div>
                </div>
              )}

              {topology === 'parallel' && (
                <div className="w-full max-w-lg p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-4">
                  <div className="flex justify-between items-center text-xs font-mono text-cyan-400 pb-2 border-b border-slate-800">
                    <span>COMMON RAIL VCC (+{supplyVoltage}V)</span>
                    <span>TOTAL I = {simResult ? formatEngineeringUnits(simResult.totalCurrent, 'A') : '...'}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {components.filter(c => c.type === 'resistor').map((comp) => {
                      const resComp = simResult?.components.find(c => c.id === comp.id);
                      const isSelected = selectedCompId === comp.id;
                      const isOver = resComp?.status === 'overpower';

                      return (
                        <div
                          key={comp.id}
                          onClick={() => setSelectedCompId(comp.id)}
                          className={`p-3 rounded-xl border-2 transition-all cursor-pointer text-center ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-950/40'
                              : isOver
                              ? 'border-rose-500 bg-rose-950/40 animate-pulse'
                              : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-xs font-mono font-bold text-white">{comp.designator}</div>
                          <div className="text-xs font-mono text-amber-400">{comp.value} Ω</div>
                          <div className="text-[10px] font-mono text-emerald-400 mt-1">
                            {resComp?.current ? formatEngineeringUnits(resComp.current, 'A') : '—'}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-xs font-mono text-slate-500 pt-2 border-t border-slate-800 text-center">
                    COMMON RETURN GND (0.0V)
                  </div>
                </div>
              )}

              {topology === 'series_parallel' && (
                <div className="w-full max-w-lg p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-4 text-xs font-mono">
                  <div className="text-cyan-400 font-bold mb-2">
                    LADDER NETWORK: R1 ➔ [R2 || R3] ➔ R4 ➔ GND
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-center w-20">
                      <div>R1 (Top)</div>
                      <div className="text-amber-400">100 Ω</div>
                    </div>
                    <span>➔</span>
                    <div className="space-y-2">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-center w-24">
                        <div>R2 (Branch A)</div>
                        <div className="text-amber-400">200 Ω</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-center w-24">
                        <div>R3 (Branch B)</div>
                        <div className="text-amber-400">200 Ω</div>
                      </div>
                    </div>
                    <span>➔</span>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-center w-20">
                      <div>R4 (Base)</div>
                      <div className="text-amber-400">50 Ω</div>
                    </div>
                  </div>
                </div>
              )}

              {topology === 'voltage_divider' && (
                <div className="w-full max-w-sm p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 text-center font-mono space-y-3">
                  <div className="text-xs text-cyan-400">+Vin (+{supplyVoltage}V)</div>
                  <div className="w-0.5 h-4 bg-cyan-400 mx-auto" />
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 w-36 mx-auto">
                    <div className="text-xs font-bold text-white">R1 (Upper)</div>
                    <div className="text-xs text-amber-400">10 kΩ</div>
                  </div>
                  <div className="w-0.5 h-4 bg-cyan-400 mx-auto" />
                  <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-800 w-44 mx-auto">
                    <div className="text-[11px] text-emerald-300">V_OUT NODE PROBE</div>
                    <div className="text-sm font-bold text-emerald-400">
                      {simResult?.nodeVoltages['V_OUT'] ? `${simResult.nodeVoltages['V_OUT'].toFixed(3)} V` : '...'}
                    </div>
                  </div>
                  <div className="w-0.5 h-4 bg-cyan-400 mx-auto" />
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 w-36 mx-auto">
                    <div className="text-xs font-bold text-white">R2 (Lower)</div>
                    <div className="text-xs text-amber-400">10 kΩ</div>
                  </div>
                  <div className="w-0.5 h-4 bg-slate-600 mx-auto" />
                  <div className="text-xs text-slate-500">GND (0.0V)</div>
                </div>
              )}

              {topology === 'rc_transient' && (
                <div className="w-full max-w-lg p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-4 font-mono">
                  <div className="text-xs text-cyan-400 flex justify-between">
                    <span>STEP INPUT: 0V ➔ {supplyVoltage}V</span>
                    <span>τ = R × C = {simResult?.timeConstant ? formatEngineeringUnits(simResult.timeConstant, 's') : '...'}</span>
                  </div>

                  {/* SVG Step Response Plot */}
                  <div className="h-44 w-full bg-slate-950 rounded-lg p-2 border border-slate-800 relative">
                    <svg viewBox="0 0 300 120" className="w-full h-full">
                      {/* Grid lines */}
                      <line x1="20" y1="10" x2="290" y2="10" stroke="#1e293b" strokeDasharray="3" />
                      <line x1="20" y1="60" x2="290" y2="60" stroke="#1e293b" strokeDasharray="3" />
                      <line x1="20" y1="110" x2="290" y2="110" stroke="#334155" />
                      <line x1="20" y1="10" x2="20" y2="110" stroke="#334155" />
                      {/* 63.2% marker */}
                      <line x1="20" y1="46" x2="290" y2="46" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="2" />
                      <text x="295" y="48" fill="#f59e0b" fontSize="7" textAnchor="end">1τ (63.2%)</text>
                      {/* Exponential curve */}
                      <path
                        d="M 20,110 Q 55,50 100,25 T 200,12 T 280,10"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Warnings Bar */}
            {simResult?.warnings && simResult.warnings.length > 0 && (
              <div className="pt-3 border-t border-slate-900 space-y-1">
                {simResult.warnings.map((w, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Telemetry Inspector & Component Editor (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Global Circuit Measurements */}
          {simResult && (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>{t.nodeTelemetry}</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 block">{t.equivalentReq}</span>
                  <strong className="text-lg font-mono text-amber-400">
                    {simResult.equivalentResistance.toFixed(2)} Ω
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 block">{t.totalCircuitCurrent}</span>
                  <strong className="text-lg font-mono text-emerald-400">
                    {formatEngineeringUnits(simResult.totalCurrent, 'A')}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 block">{t.totalDcPower}</span>
                  <strong className="text-lg font-mono text-rose-400">
                    {formatEngineeringUnits(simResult.totalPower, 'W')}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 block">{t.supplyRailPotential}</span>
                  <strong className="text-lg font-mono text-cyan-400">
                    {simResult.supplyVoltage.toFixed(2)} V
                  </strong>
                </div>
              </div>

              {/* Node Voltages Map */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-mono text-slate-400 block font-bold">
                  {t.junctionPotentials}
                </span>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  {Object.entries(simResult.nodeVoltages).map(([node, volt]) => (
                    <div key={node} className="p-2 rounded bg-slate-950/70 border border-slate-800 flex justify-between">
                      <span className="text-slate-400">{node}:</span>
                      <span className="text-cyan-300 font-bold">{volt.toFixed(3)} V</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Component Parameter Tuner */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300 flex items-center justify-between">
              <span>{t.branchMeasurements}</span>
              <span className="text-[10px] text-slate-400 font-mono">{t.paramTuning}</span>
            </h3>

            <div className="space-y-3">
              {components.map((c) => {
                const metric = simResult?.components.find(item => item.id === c.id);
                const typeName = c.type === 'resistor' ? t.resistor : c.type === 'voltage_source' ? t.voltageSource : c.type === 'capacitor' ? t.capacitor : c.type;
                return (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-white">{c.designator} ({typeName})</span>
                      {c.type === 'resistor' && (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={c.value}
                            onChange={(e) => updateComponentValue(c.id, parseFloat(e.target.value) || 1)}
                            className="w-20 px-2 py-0.5 text-xs font-mono rounded bg-slate-900 border border-slate-700 text-white"
                          />
                          <span className="text-xs font-mono text-slate-400">Ω</span>
                          {components.filter(item => item.type === 'resistor').length > 1 && (
                            <button
                              onClick={() => removeResistor(c.id)}
                              className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                              title={t.deleteComp}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {metric && (
                      <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-900">
                        <span>{language === 'ar' ? 'الهبوط: ' : 'Drop: '}{metric.voltageDrop?.toFixed(2)}V</span>
                        <span>{language === 'ar' ? 'التيار: ' : 'Current: '}{metric.current ? formatEngineeringUnits(metric.current, 'A') : '—'}</span>
                        <span className={metric.status === 'overpower' ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {language === 'ar' ? 'القدرة: ' : 'Power: '}{metric.power ? formatEngineeringUnits(metric.power, 'W') : '—'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
