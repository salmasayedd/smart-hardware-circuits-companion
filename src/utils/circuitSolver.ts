import { SimulatorComponent, SimulationResult } from '../types';

export function solveCircuit(
  topology: 'series' | 'parallel' | 'series_parallel' | 'voltage_divider' | 'rc_transient',
  supplyVoltage: number,
  components: SimulatorComponent[],
  extraParams?: { rLoad?: number }
): SimulationResult {
  const warnings: string[] = [];

  if (supplyVoltage < 0) {
    warnings.push('Reverse polarity: Supply voltage is negative relative to reference GND.');
  }

  // Handle Series topology
  if (topology === 'series') {
    const resistors = components.filter(c => c.type === 'resistor');
    let rTotal = resistors.reduce((sum, r) => sum + Math.max(0, r.value), 0);

    if (rTotal <= 0.001) {
      warnings.push('CRITICAL: Near zero-ohm short circuit detected! Extremely high current will damage supply.');
      rTotal = 0.001; // Avoid divide by zero
    }

    const totalCurrent = supplyVoltage / rTotal;
    const totalPower = supplyVoltage * totalCurrent;

    const nodeVoltages: Record<string, number> = {
      'GND': 0,
      'N_SRC': supplyVoltage
    };

    let accumulatedDrop = 0;
    const updatedComponents = components.map((comp, idx) => {
      if (comp.type === 'voltage_source') {
        return {
          ...comp,
          voltageDrop: supplyVoltage,
          current: totalCurrent,
          power: totalPower,
          status: 'normal' as const
        };
      }

      if (comp.type === 'resistor') {
        const vDrop = totalCurrent * comp.value;
        const pDrop = totalCurrent * totalCurrent * comp.value;
        const maxP = comp.maxPowerRating || 0.25;
        const isOverpower = pDrop > maxP;

        if (isOverpower) {
          warnings.push(`Thermal Warning: Resistor ${comp.designator} dissipates ${pDrop.toFixed(3)}W, exceeding its ${maxP}W rating.`);
        }

        accumulatedDrop += vDrop;
        const nodeName = `N_${idx + 1}`;
        nodeVoltages[nodeName] = Math.max(0, supplyVoltage - accumulatedDrop);

        return {
          ...comp,
          voltageDrop: vDrop,
          current: totalCurrent,
          power: pDrop,
          status: isOverpower ? ('overpower' as const) : ('normal' as const)
        };
      }

      return comp;
    });

    return {
      topology,
      supplyVoltage,
      equivalentResistance: rTotal,
      totalCurrent,
      totalPower,
      components: updatedComponents,
      nodeVoltages,
      warnings
    };
  }

  // Handle Parallel topology
  if (topology === 'parallel') {
    const resistors = components.filter(c => c.type === 'resistor');
    let conductance = 0;

    for (const r of resistors) {
      if (r.value <= 0.001) {
        warnings.push(`CRITICAL: Resistor ${r.designator} is short-circuited (0 Ω)!`);
      }
      conductance += 1 / Math.max(0.001, r.value);
    }

    const rEq = conductance > 0 ? 1 / conductance : 0;
    const totalCurrent = supplyVoltage * conductance;
    const totalPower = supplyVoltage * totalCurrent;

    const nodeVoltages: Record<string, number> = {
      'GND': 0,
      'VCC': supplyVoltage
    };

    const updatedComponents = components.map(comp => {
      if (comp.type === 'voltage_source') {
        return {
          ...comp,
          voltageDrop: supplyVoltage,
          current: totalCurrent,
          power: totalPower,
          status: 'normal' as const
        };
      }

      if (comp.type === 'resistor') {
        const iBranch = supplyVoltage / Math.max(0.001, comp.value);
        const pBranch = supplyVoltage * iBranch;
        const maxP = comp.maxPowerRating || 0.25;
        const isOverpower = pBranch > maxP;

        if (isOverpower) {
          warnings.push(`Thermal Warning: Parallel branch ${comp.designator} dissipates ${pBranch.toFixed(3)}W (> ${maxP}W).`);
        }

        return {
          ...comp,
          voltageDrop: supplyVoltage,
          current: iBranch,
          power: pBranch,
          status: isOverpower ? ('overpower' as const) : ('normal' as const)
        };
      }

      return comp;
    });

    return {
      topology,
      supplyVoltage,
      equivalentResistance: rEq,
      totalCurrent,
      totalPower,
      components: updatedComponents,
      nodeVoltages,
      warnings
    };
  }

  // Handle Series-Parallel (Bridge/Ladder Network)
  // R1 in series with (R2 || R3) in series with R4
  if (topology === 'series_parallel') {
    const r1 = components.find(c => c.designator === 'R1')?.value || 100;
    const r2 = components.find(c => c.designator === 'R2')?.value || 200;
    const r3 = components.find(c => c.designator === 'R3')?.value || 200;
    const r4 = components.find(c => c.designator === 'R4')?.value || 50;

    const rParallel = (r2 * r3) / Math.max(0.001, r2 + r3);
    const rEq = r1 + rParallel + r4;

    const totalCurrent = supplyVoltage / Math.max(0.001, rEq);
    const totalPower = supplyVoltage * totalCurrent;

    const vDropR1 = totalCurrent * r1;
    const vDropParallel = totalCurrent * rParallel;
    const vDropR4 = totalCurrent * r4;

    const nodeVoltages: Record<string, number> = {
      'GND': 0,
      'VCC': supplyVoltage,
      'N_MID1': supplyVoltage - vDropR1,
      'N_MID2': supplyVoltage - vDropR1 - vDropParallel
    };

    const updatedComponents = components.map(comp => {
      if (comp.type === 'voltage_source') {
        return {
          ...comp,
          voltageDrop: supplyVoltage,
          current: totalCurrent,
          power: totalPower,
          status: 'normal' as const
        };
      }

      if (comp.designator === 'R1') {
        const p = totalCurrent * totalCurrent * r1;
        return {
          ...comp,
          voltageDrop: vDropR1,
          current: totalCurrent,
          power: p,
          status: p > (comp.maxPowerRating || 0.25) ? ('overpower' as const) : ('normal' as const)
        };
      }

      if (comp.designator === 'R2') {
        const i = vDropParallel / Math.max(0.001, r2);
        const p = i * i * r2;
        return {
          ...comp,
          voltageDrop: vDropParallel,
          current: i,
          power: p,
          status: p > (comp.maxPowerRating || 0.25) ? ('overpower' as const) : ('normal' as const)
        };
      }

      if (comp.designator === 'R3') {
        const i = vDropParallel / Math.max(0.001, r3);
        const p = i * i * r3;
        return {
          ...comp,
          voltageDrop: vDropParallel,
          current: i,
          power: p,
          status: p > (comp.maxPowerRating || 0.25) ? ('overpower' as const) : ('normal' as const)
        };
      }

      if (comp.designator === 'R4') {
        const p = totalCurrent * totalCurrent * r4;
        return {
          ...comp,
          voltageDrop: vDropR4,
          current: totalCurrent,
          power: p,
          status: p > (comp.maxPowerRating || 0.25) ? ('overpower' as const) : ('normal' as const)
        };
      }

      return comp;
    });

    return {
      topology,
      supplyVoltage,
      equivalentResistance: rEq,
      totalCurrent,
      totalPower,
      components: updatedComponents,
      nodeVoltages,
      warnings
    };
  }

  // Handle Voltage Divider
  if (topology === 'voltage_divider') {
    const r1 = components.find(c => c.designator === 'R1')?.value || 1000;
    const r2 = components.find(c => c.designator === 'R2')?.value || 1000;
    const rLoad = extraParams?.rLoad;

    let r2Effective = r2;
    if (rLoad && rLoad > 0) {
      r2Effective = (r2 * rLoad) / (r2 + rLoad);
      warnings.push(`Load resistance R_load (${rLoad}Ω) causes loading effect.`);
    }

    const rEq = r1 + r2Effective;
    const totalCurrent = supplyVoltage / Math.max(0.001, rEq);
    const totalPower = supplyVoltage * totalCurrent;

    const vOut = supplyVoltage * (r2Effective / Math.max(0.001, rEq));
    const vDropR1 = supplyVoltage - vOut;

    const nodeVoltages: Record<string, number> = {
      'GND': 0,
      'VCC': supplyVoltage,
      'V_OUT': vOut
    };

    const updatedComponents = components.map(comp => {
      if (comp.type === 'voltage_source') {
        return {
          ...comp,
          voltageDrop: supplyVoltage,
          current: totalCurrent,
          power: totalPower,
          status: 'normal' as const
        };
      }

      if (comp.designator === 'R1') {
        const p = totalCurrent * totalCurrent * r1;
        return {
          ...comp,
          voltageDrop: vDropR1,
          current: totalCurrent,
          power: p,
          status: p > (comp.maxPowerRating || 0.25) ? ('overpower' as const) : ('normal' as const)
        };
      }

      if (comp.designator === 'R2') {
        const iR2 = vOut / Math.max(0.001, r2);
        const p = iR2 * iR2 * r2;
        return {
          ...comp,
          voltageDrop: vOut,
          current: iR2,
          power: p,
          status: p > (comp.maxPowerRating || 0.25) ? ('overpower' as const) : ('normal' as const)
        };
      }

      return comp;
    });

    return {
      topology,
      supplyVoltage,
      equivalentResistance: rEq,
      totalCurrent,
      totalPower,
      components: updatedComponents,
      nodeVoltages,
      warnings
    };
  }

  // Handle RC Transient
  // Source -> R -> C -> GND
  const rComp = components.find(c => c.type === 'resistor') || { value: 1000, designator: 'R1' };
  const cComp = components.find(c => c.type === 'capacitor') || { value: 0.00001, designator: 'C1' };

  const rVal = rComp.value;
  const cVal = cComp.value;
  const tau = rVal * cVal;
  const cutoffFreq = 1 / (2 * Math.PI * rVal * cVal);
  const peakInrush = supplyVoltage / Math.max(0.001, rVal);

  const updatedComponents = components.map(comp => {
    if (comp.type === 'voltage_source') {
      return {
        ...comp,
        voltageDrop: supplyVoltage,
        current: peakInrush,
        power: supplyVoltage * peakInrush,
        status: 'normal' as const
      };
    }
    if (comp.type === 'resistor') {
      return {
        ...comp,
        voltageDrop: supplyVoltage, // at t=0
        current: peakInrush,
        power: peakInrush * peakInrush * comp.value,
        status: 'normal' as const
      };
    }
    if (comp.type === 'capacitor') {
      return {
        ...comp,
        voltageDrop: supplyVoltage, // at steady state (t -> inf)
        current: 0,
        power: 0,
        status: 'normal' as const
      };
    }
    return comp;
  });

  return {
    topology: 'rc_transient',
    supplyVoltage,
    equivalentResistance: rVal,
    totalCurrent: peakInrush,
    totalPower: supplyVoltage * peakInrush,
    components: updatedComponents,
    nodeVoltages: {
      'GND': 0,
      'VCC': supplyVoltage,
      'V_CAP_FINAL': supplyVoltage
    },
    timeConstant: tau,
    cutoffFrequency: cutoffFreq,
    warnings: [
      `Peak inrush current at switch closure t=0: ${(peakInrush * 1000).toFixed(2)} mA.`,
      `Steady-state DC current (t > 5τ): 0.0 mA (Capacitor blocks DC).`
    ]
  };
}
