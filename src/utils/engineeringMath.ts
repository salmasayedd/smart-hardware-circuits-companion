/**
 * Deterministic Engineering Mathematical Functions
 * Production-grade implementations with rigorous edge-case checking
 */

// Standard E12 and E24 resistor base mantissas
export const E12_VALUES = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
export const E24_VALUES = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0,
  3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1
];

/**
 * Finds the nearest commercial standard E24 resistor value
 */
export function getNearestE24(resistance: number): number {
  if (resistance <= 0 || !isFinite(resistance)) return 0;
  
  const exponent = Math.floor(Math.log10(resistance));
  const mantissa = resistance / Math.pow(10, exponent);

  let closestMantissa = E24_VALUES[0];
  let minDiff = Math.abs(mantissa - closestMantissa);

  for (const val of E24_VALUES) {
    const diff = Math.abs(mantissa - val);
    if (diff < minDiff) {
      minDiff = diff;
      closestMantissa = val;
    }
  }

  // Also check wrapping to 10 (which is 1.0 * 10^(exp+1))
  const diffToUpper = Math.abs(mantissa - 10.0);
  if (diffToUpper < minDiff) {
    return 1.0 * Math.pow(10, exponent + 1);
  }

  return Number((closestMantissa * Math.pow(10, exponent)).toPrecision(3));
}

/**
 * Format numbers with SI prefixes (e.g. 4.7 kΩ, 100 nF, 12.5 mA)
 */
export function formatEngineeringUnits(value: number, unit: string): string {
  if (!isFinite(value) || isNaN(value)) return `NaN ${unit}`;
  if (value === 0) return `0 ${unit}`;

  const absVal = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absVal >= 1e9) return `${sign}${(absVal / 1e9).toFixed(3)} G${unit}`;
  if (absVal >= 1e6) return `${sign}${(absVal / 1e6).toFixed(3)} M${unit}`;
  if (absVal >= 1e3) return `${sign}${(absVal / 1e3).toFixed(3)} k${unit}`;
  if (absVal >= 1) return `${sign}${absVal.toFixed(3)} ${unit}`;
  if (absVal >= 1e-3) return `${sign}${(absVal * 1e3).toFixed(3)} m${unit}`;
  if (absVal >= 1e-6) return `${sign}${(absVal * 1e6).toFixed(3)} µ${unit}`;
  if (absVal >= 1e-9) return `${sign}${(absVal * 1e9).toFixed(3)} n${unit}`;
  if (absVal >= 1e-12) return `${sign}${(absVal * 1e12).toFixed(3)} p${unit}`;

  return `${sign}${value.toExponential(3)} ${unit}`;
}

// 1. OHM'S LAW
export interface OhmsLawResult {
  voltage: number; // Volts
  current: number; // Amperes
  resistance: number; // Ohms
  power: number; // Watts
  steps: string[];
  formula: string;
}

export function calculateOhmsLaw(params: {
  voltage?: number;
  current?: number;
  resistance?: number;
}): OhmsLawResult {
  const { voltage, current, resistance } = params;

  if (voltage !== undefined && current !== undefined) {
    if (current === 0) {
      return {
        voltage,
        current: 0,
        resistance: Infinity,
        power: 0,
        steps: ['R = V / I = ' + voltage + ' / 0 => Infinite (Open Circuit)', 'P = V * I = 0 W'],
        formula: 'R = V / I, P = V * I'
      };
    }
    const r = voltage / current;
    const p = voltage * current;
    return {
      voltage,
      current,
      resistance: r,
      power: p,
      steps: [
        `R = V / I = ${voltage} V / ${current} A = ${r.toFixed(4)} Ω`,
        `P = V * I = ${voltage} V * ${current} A = ${p.toFixed(4)} W`
      ],
      formula: 'R = V / I, P = V * I'
    };
  }

  if (voltage !== undefined && resistance !== undefined) {
    if (resistance <= 0) throw new Error('Resistance must be strictly positive.');
    const i = voltage / resistance;
    const p = (voltage * voltage) / resistance;
    return {
      voltage,
      current: i,
      resistance,
      power: p,
      steps: [
        `I = V / R = ${voltage} V / ${resistance} Ω = ${i.toFixed(6)} A (${formatEngineeringUnits(i, 'A')})`,
        `P = V² / R = (${voltage})² / ${resistance} = ${p.toFixed(4)} W`
      ],
      formula: 'I = V / R, P = V² / R'
    };
  }

  if (current !== undefined && resistance !== undefined) {
    if (resistance < 0) throw new Error('Resistance cannot be negative.');
    const v = current * resistance;
    const p = current * current * resistance;
    return {
      voltage: v,
      current,
      resistance,
      power: p,
      steps: [
        `V = I * R = ${current} A * ${resistance} Ω = ${v.toFixed(4)} V`,
        `P = I² * R = (${current})² * ${resistance} = ${p.toFixed(4)} W`
      ],
      formula: 'V = I * R, P = I² * R'
    };
  }

  throw new Error('Provide at least two parameters among Voltage, Current, and Resistance.');
}

// 2. ELECTRICAL POWER CALCULATOR
export interface PowerResult {
  power: number; // Watts
  energyJoules: number; // Joules (W*s)
  energyKWh: number; // kWh
  steps: string[];
}

export function calculatePower(params: {
  voltage?: number;
  current?: number;
  resistance?: number;
  timeHours?: number;
}): PowerResult {
  let p = 0;
  const steps: string[] = [];
  const { voltage, current, resistance, timeHours = 1 } = params;

  if (voltage !== undefined && current !== undefined) {
    p = voltage * current;
    steps.push(`P = V * I = ${voltage} V * ${current} A = ${p.toFixed(4)} W`);
  } else if (current !== undefined && resistance !== undefined) {
    p = current * current * resistance;
    steps.push(`P = I² * R = (${current})² * ${resistance} = ${p.toFixed(4)} W`);
  } else if (voltage !== undefined && resistance !== undefined) {
    if (resistance === 0) throw new Error('Resistance cannot be zero.');
    p = (voltage * voltage) / resistance;
    steps.push(`P = V² / R = (${voltage})² / ${resistance} = ${p.toFixed(4)} W`);
  } else {
    throw new Error('Provide two electrical variables to calculate power.');
  }

  const seconds = timeHours * 3600;
  const energyJoules = p * seconds;
  const energyKWh = (p * timeHours) / 1000;

  steps.push(`Energy in ${timeHours} h = P * t = ${p.toFixed(2)} W * ${seconds} s = ${energyJoules.toFixed(1)} J`);
  steps.push(`Electrical Consumption = ${energyKWh.toFixed(5)} kWh`);

  return { power: p, energyJoules, energyKWh, steps };
}

// 3. RESISTORS IN SERIES
export interface SeriesResult {
  rTotal: number;
  totalCurrent: number;
  voltageDrops: number[];
  powerDissipations: number[];
  steps: string[];
}

export function calculateSeriesResistors(resistors: number[], supplyVoltage: number = 0): SeriesResult {
  if (!resistors || resistors.length === 0) {
    throw new Error('At least one resistor value is required.');
  }
  for (const r of resistors) {
    if (r < 0) throw new Error('Resistor values must be non-negative.');
  }

  const rTotal = resistors.reduce((sum, r) => sum + r, 0);
  const totalCurrent = rTotal > 0 && supplyVoltage > 0 ? supplyVoltage / rTotal : 0;

  const voltageDrops = resistors.map(r => (rTotal > 0 ? supplyVoltage * (r / rTotal) : 0));
  const powerDissipations = resistors.map(r => totalCurrent * totalCurrent * r);

  const steps = [
    `R_total = ${resistors.map(r => `${r}Ω`).join(' + ')} = ${rTotal.toFixed(3)} Ω`,
    supplyVoltage > 0
      ? `Total Current I = V_s / R_total = ${supplyVoltage}V / ${rTotal.toFixed(2)}Ω = ${formatEngineeringUnits(totalCurrent, 'A')}`
      : 'Supply voltage not provided, voltage distribution omitted.'
  ];

  return { rTotal, totalCurrent, voltageDrops, powerDissipations, steps };
}

// 4. RESISTORS IN PARALLEL
export interface ParallelResult {
  rEquivalent: number;
  branchCurrents: number[];
  powerDissipations: number[];
  steps: string[];
}

export function calculateParallelResistors(resistors: number[], supplyVoltage: number = 0): ParallelResult {
  if (!resistors || resistors.length === 0) {
    throw new Error('At least one resistor value is required.');
  }
  for (const r of resistors) {
    if (r <= 0) throw new Error('Parallel resistors must have strictly positive values.');
  }

  const conductanceSum = resistors.reduce((sum, r) => sum + 1 / r, 0);
  const rEquivalent = 1 / conductanceSum;

  const branchCurrents = resistors.map(r => (supplyVoltage > 0 ? supplyVoltage / r : 0));
  const powerDissipations = resistors.map(r => (supplyVoltage > 0 ? (supplyVoltage * supplyVoltage) / r : 0));

  const steps = [
    `1 / R_eq = ${resistors.map(r => `(1 / ${r}Ω)`).join(' + ')} = ${conductanceSum.toPrecision(4)} S (Siemens)`,
    `R_eq = 1 / ${conductanceSum.toPrecision(4)} = ${rEquivalent.toFixed(3)} Ω`
  ];

  if (supplyVoltage > 0) {
    const totalI = supplyVoltage / rEquivalent;
    steps.push(`Total Current I_total = V_s / R_eq = ${supplyVoltage}V / ${rEquivalent.toFixed(2)}Ω = ${formatEngineeringUnits(totalI, 'A')}`);
  }

  return { rEquivalent, branchCurrents, powerDissipations, steps };
}

// 5. VOLTAGE DIVIDER
export interface VoltageDividerResult {
  vOutUnloaded: number;
  vOutLoaded: number;
  theveninResistance: number;
  dividerCurrent: number;
  loadingErrorPercent: number;
  steps: string[];
}

export function calculateVoltageDivider(
  vIn: number,
  r1: number,
  r2: number,
  rLoad?: number
): VoltageDividerResult {
  if (r1 <= 0 || r2 <= 0) {
    throw new Error('R1 and R2 must be positive resistances.');
  }

  const vOutUnloaded = vIn * (r2 / (r1 + r2));
  const theveninResistance = (r1 * r2) / (r1 + r2);
  const dividerCurrent = vIn / (r1 + r2);

  let vOutLoaded = vOutUnloaded;
  let loadingErrorPercent = 0;
  const steps: string[] = [
    `Unloaded V_out = V_in * (R2 / (R1 + R2)) = ${vIn}V * (${r2} / (${r1} + ${r2})) = ${vOutUnloaded.toFixed(3)} V`,
    `Thevenin Equivalent Resistance R_th = (R1 * R2) / (R1 + R2) = ${theveninResistance.toFixed(2)} Ω`,
    `Quiescent Current (unloaded) I_q = ${formatEngineeringUnits(dividerCurrent, 'A')}`
  ];

  if (rLoad !== undefined && rLoad > 0) {
    const r2Equivalent = (r2 * rLoad) / (r2 + rLoad);
    vOutLoaded = vIn * (r2Equivalent / (r1 + r2Equivalent));
    loadingErrorPercent = Math.abs((vOutUnloaded - vOutLoaded) / vOutUnloaded) * 100;

    steps.push(`Effective Lower Resistance with Load R_load (${rLoad}Ω): R2||R_load = ${r2Equivalent.toFixed(2)} Ω`);
    steps.push(`Loaded V_out = ${vIn}V * (${r2Equivalent.toFixed(2)} / (${r1} + ${r2Equivalent.toFixed(2)})) = ${vOutLoaded.toFixed(3)} V`);
    steps.push(`Loading Voltage Drop Error: ${loadingErrorPercent.toFixed(2)}%`);
  }

  return {
    vOutUnloaded,
    vOutLoaded,
    theveninResistance,
    dividerCurrent,
    loadingErrorPercent,
    steps
  };
}

// 6. LED CURRENT-LIMITING RESISTOR
export interface LedResistorResult {
  calculatedResistance: number;
  standardE24Resistance: number;
  resistorPower: number;
  standardCurrent: number;
  standardPower: number;
  recommendedWattageRating: string;
  steps: string[];
}

export function calculateLedResistor(
  vSupply: number,
  vForward: number,
  targetCurrentAmps: number
): LedResistorResult {
  if (vSupply <= vForward) {
    throw new Error(`Supply voltage (${vSupply}V) must be strictly greater than LED forward voltage (${vForward}V).`);
  }
  if (targetCurrentAmps <= 0) {
    throw new Error('Target forward current must be positive (e.g. 0.02 A for 20mA).');
  }

  const vDrop = vSupply - vForward;
  const calculatedResistance = vDrop / targetCurrentAmps;
  const standardE24 = getNearestE24(calculatedResistance);

  const resistorPower = targetCurrentAmps * targetCurrentAmps * calculatedResistance;
  const standardCurrent = vDrop / standardE24;
  const standardPower = standardCurrent * standardCurrent * standardE24;

  let recommendedWattageRating = '1/4 Watt (0.25 W)';
  if (standardPower > 0.5) recommendedWattageRating = '1 Watt (1.0 W) or higher';
  else if (standardPower > 0.25) recommendedWattageRating = '1/2 Watt (0.5 W)';
  else if (standardPower > 0.125) recommendedWattageRating = '1/4 Watt (0.25 W)';
  else recommendedWattageRating = '1/8 Watt (0.125 W)';

  const steps = [
    `Voltage across resistor V_R = V_supply - V_f = ${vSupply}V - ${vForward}V = ${vDrop.toFixed(2)} V`,
    `Theoretical R = V_R / I_f = ${vDrop.toFixed(2)}V / ${targetCurrentAmps}A = ${calculatedResistance.toFixed(2)} Ω`,
    `Nearest Standard E24 Commercial Resistor: ${standardE24} Ω`,
    `Actual Operating Current with ${standardE24}Ω = ${vDrop.toFixed(2)}V / ${standardE24}Ω = ${(standardCurrent * 1000).toFixed(2)} mA`,
    `Power Dissipation P_R = I² * R = ${standardPower.toFixed(3)} W -> Recommend: ${recommendedWattageRating}`
  ];

  return {
    calculatedResistance,
    standardE24Resistance: standardE24,
    resistorPower,
    standardCurrent,
    standardPower,
    recommendedWattageRating,
    steps
  };
}

// 7. RC CIRCUIT CALCULATOR
export interface RcCircuitResult {
  timeConstant: number; // seconds
  cutoffFrequency: number; // Hz
  energyJoules: number; // Joules
  chargingCurve: Array<{ tOverTau: number; timeSec: number; voltage: number; current: number }>;
  transientAtUserTime?: { time: number; voltage: number; percent: number };
  steps: string[];
}

export function calculateRcCircuit(
  resistance: number,
  capacitance: number,
  supplyVoltage: number,
  queryTimeSeconds?: number
): RcCircuitResult {
  if (resistance <= 0 || capacitance <= 0) {
    throw new Error('Resistance and Capacitance must be strictly positive.');
  }

  const tau = resistance * capacitance; // seconds
  const cutoffFrequency = 1 / (2 * Math.PI * resistance * capacitance);
  const energyJoules = 0.5 * capacitance * supplyVoltage * supplyVoltage;

  // Generate 10 standard points across 0 to 5 tau
  const chargingCurve = [];
  for (let i = 0; i <= 10; i++) {
    const tOverTau = i * 0.5;
    const timeSec = tOverTau * tau;
    const voltage = supplyVoltage * (1 - Math.exp(-tOverTau));
    const current = (supplyVoltage / resistance) * Math.exp(-tOverTau);
    chargingCurve.push({ tOverTau, timeSec, voltage, current });
  }

  let transientAtUserTime;
  if (queryTimeSeconds !== undefined && queryTimeSeconds >= 0) {
    const exponent = -queryTimeSeconds / tau;
    const v = supplyVoltage * (1 - Math.exp(exponent));
    const pct = (1 - Math.exp(exponent)) * 100;
    transientAtUserTime = { time: queryTimeSeconds, voltage: v, percent: pct };
  }

  const steps = [
    `Time Constant τ = R * C = ${resistance} Ω * ${capacitance} F = ${formatEngineeringUnits(tau, 's')}`,
    `Low-Pass Cutoff Frequency (-3dB) f_c = 1 / (2πRC) = ${formatEngineeringUnits(cutoffFrequency, 'Hz')}`,
    `Maximum Stored Energy E = 1/2 * C * V² = ${formatEngineeringUnits(energyJoules, 'J')}`,
    `Settling Time (to 99.3% full charge) ~ 5τ = ${(tau * 5).toPrecision(4)} s`
  ];

  return {
    timeConstant: tau,
    cutoffFrequency,
    energyJoules,
    chargingCurve,
    transientAtUserTime,
    steps
  };
}

// 8. ENGINEERING UNIT CONVERSION MATRIX
export type UnitCategory = 'voltage' | 'current' | 'resistance' | 'capacitance' | 'inductance' | 'power' | 'frequency' | 'time';

export const UNIT_FACTORS: Record<UnitCategory, Record<string, number>> = {
  voltage: {
    'V': 1,
    'mV': 1e-3,
    'µV': 1e-6,
    'kV': 1e3
  },
  current: {
    'A': 1,
    'mA': 1e-3,
    'µA': 1e-6,
    'nA': 1e-9,
    'kA': 1e3
  },
  resistance: {
    'Ω': 1,
    'mΩ': 1e-3,
    'kΩ': 1e3,
    'MΩ': 1e6,
    'GΩ': 1e9
  },
  capacitance: {
    'F': 1,
    'mF': 1e-3,
    'µF': 1e-6,
    'nF': 1e-9,
    'pF': 1e-12
  },
  inductance: {
    'H': 1,
    'mH': 1e-3,
    'µH': 1e-6,
    'nH': 1e-9
  },
  power: {
    'W': 1,
    'mW': 1e-3,
    'µW': 1e-6,
    'kW': 1e3,
    'MW': 1e6
  },
  frequency: {
    'Hz': 1,
    'kHz': 1e3,
    'MHz': 1e6,
    'GHz': 1e9
  },
  time: {
    's': 1,
    'ms': 1e-3,
    'µs': 1e-6,
    'ns': 1e-9,
    'min': 60,
    'hr': 3600
  }
};

export function convertUnits(
  val: number,
  category: UnitCategory,
  fromUnit: string,
  toUnit: string
): number {
  const table = UNIT_FACTORS[category];
  if (!table || table[fromUnit] === undefined || table[toUnit] === undefined) {
    throw new Error('Unsupported conversion units.');
  }

  const inBase = val * table[fromUnit];
  return inBase / table[toUnit];
}
