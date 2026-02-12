
import { WireMaterial, WireType, CoilConfig, SimulationResult } from '../types.ts';
import { RESISTIVITY, GAUGE_TO_MM } from '../constants.ts';

// Thermal properties roughly estimated for common alloys
const HEAT_CAPACITY: Record<WireMaterial, number> = {
  [WireMaterial.KANTHAL_A1]: 0.46, // J/g·K
  [WireMaterial.NICHROME_80]: 0.45,
  [WireMaterial.SS316L]: 0.50,
  [WireMaterial.NI200]: 0.44,
  [WireMaterial.TITANIUM]: 0.52
};

const DENSITY: Record<WireMaterial, number> = {
  [WireMaterial.KANTHAL_A1]: 7.1, // g/cm³
  [WireMaterial.NICHROME_80]: 8.4,
  [WireMaterial.SS316L]: 8.0,
  [WireMaterial.NI200]: 8.9,
  [WireMaterial.TITANIUM]: 4.5
};

export const runSimulation = (
  material: WireMaterial,
  wireConfig: WireType,
  coilCount: CoilConfig,
  gauge: number,
  id: number,
  wraps: number,
  voltage: number = 3.7
): { simulation: SimulationResult, resistance: number, surfaceArea: number, heatCapacity: number } => {
  const wireDiameter = GAUGE_TO_MM[gauge] || 0.4;
  const wireRadius = wireDiameter / 2;
  const area = Math.PI * Math.pow(wireRadius, 2);
  const circumference = Math.PI * (id + wireDiameter);
  
  const legLength = 5; // standard legs
  let wireLengthPerCoil = (circumference * wraps) + legLength;
  const wireCountMultiplier = wireConfig === 'Parallel' ? 2 : wireConfig === 'Twisted' ? 2.1 : 1;
  const totalWireLengthPerCoil = wireLengthPerCoil * wireCountMultiplier;
  
  const resPerStrand = (RESISTIVITY[material] * (wireLengthPerCoil / 1000)) / area;
  let singleCoilRes = resPerStrand / wireCountMultiplier;
  
  const numCoils = coilCount === 'Dual' ? 2 : coilCount === 'Triple' ? 3 : coilCount === 'Quad' ? 4 : 1;
  const finalResistance = singleCoilRes / numCoils;

  const surfaceAreaPerCoil = Math.PI * wireDiameter * totalWireLengthPerCoil;
  const totalSurfaceArea = surfaceAreaPerCoil * numCoils;
  
  const power = Math.pow(voltage, 2) / finalResistance;
  const heatFlux = power / totalSurfaceArea * 1000; // mW/mm²
  
  // Calculate mass for Heat Capacity
  // Volume in mm³: Area * Length
  const totalVolume = area * totalWireLengthPerCoil * numCoils;
  const massGrams = (totalVolume / 1000) * DENSITY[material];
  const heatCap = massGrams * HEAT_CAPACITY[material] * 1000; // mJ/K
  
  // Ramp-up: time to reach 200°C from 25°C (dt = 175)
  // Q = mc dT => t = (mc dT) / Power
  const rampUpTime = (heatCap * 175) / (power * 1000); // seconds

  const stressIndex = (heatFlux / 350) * 100; // Normalized stress index
  const efficiencyScore = 100 - (rampUpTime * 10) - (Math.abs(heatFlux - 200) / 10);

  let thermalClass: SimulationResult['thermalClass'] = 'Balanced';
  if (heatFlux < 120) thermalClass = 'Cool';
  else if (heatFlux > 300) thermalClass = 'Hot';
  else if (heatFlux > 220) thermalClass = 'Warm';

  return {
    simulation: {
      heatFlux,
      rampUpTime,
      thermalClass,
      stressIndex,
      efficiencyScore: Math.max(0, Math.min(100, efficiencyScore))
    },
    resistance: finalResistance,
    surfaceArea: totalSurfaceArea,
    heatCapacity: heatCap
  };
};
