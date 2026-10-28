import { DEFAULT_EMISSION_FACTORS } from '../services/emissionFactors';

/**
 * Period multipliers to normalize all activity values to MONTHLY basis:
 * - daily: 30.417 days/month
 * - weekly: 4.345 weeks/month
 * - monthly: 1.0 month
 * - yearly: 1/12 (0.08333) month
 * - one_time: 1.0 (single event logged)
 */
export const PERIOD_MULTIPLIERS = {
  one_time: 1.0,
  daily: 30.417,
  weekly: 4.345,
  monthly: 1.0,
  yearly: 1 / 12,
};

/**
 * Validates numeric inputs.
 * Returns { valid: boolean, error: string | null, value: number }
 */
export function validateInput(val, fieldName = 'Value') {
  if (val === '' || val === null || val === undefined) {
    return { valid: false, error: `${fieldName} is required`, value: 0 };
  }
  const num = Number(val);
  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number`, value: 0 };
  }
  if (num < 0) {
    return { valid: false, error: `${fieldName} cannot be negative`, value: 0 };
  }
  return { valid: true, error: null, value: num };
}

/**
 * Calculates Electricity Emissions
 * Formula: kWh * emissionFactor
 */
export function calculateElectricityEmissions(kwh, period = 'monthly', customFactor = null) {
  const validation = validateInput(kwh, 'Electricity consumption');
  if (!validation.valid) return { error: validation.error, emissions: 0, normalizedMonthly: 0 };

  const factorObj = DEFAULT_EMISSION_FACTORS.electricity;
  const factor = customFactor !== null ? customFactor : factorObj.factor;
  const directEmissions = validation.value * factor;
  const multiplier = PERIOD_MULTIPLIERS[period] || 1.0;
  const normalizedMonthly = period === 'one_time' ? directEmissions : validation.value * multiplier * factor;

  return {
    rawInput: validation.value,
    unit: 'kWh',
    period,
    factor,
    factorUnit: factorObj.unit,
    formula: `${validation.value} kWh × ${factor} ${factorObj.unit}`,
    emissions: Math.round(directEmissions * 100) / 100,
    normalizedMonthly: Math.round(normalizedMonthly * 100) / 100,
    source: factorObj.source,
    error: null
  };
}

/**
 * Calculates Transportation Emissions
 * Formula: km * factor * frequencyMultiplier
 */
export function calculateTransportEmissions(km, mode = 'car_petrol', frequency = 'weekly', customFactor = null) {
  const validation = validateInput(km, 'Distance');
  if (!validation.valid) return { error: validation.error, emissions: 0, normalizedMonthly: 0 };

  const modeObj = DEFAULT_EMISSION_FACTORS.transportation[mode] || DEFAULT_EMISSION_FACTORS.transportation.car_petrol;
  const factor = customFactor !== null ? customFactor : modeObj.factor;
  const tripEmissions = validation.value * factor;
  const multiplier = PERIOD_MULTIPLIERS[frequency] || 1.0;
  const normalizedMonthly = frequency === 'one_time' ? tripEmissions : tripEmissions * multiplier;

  return {
    rawInput: validation.value,
    unit: 'km',
    mode,
    modeLabel: modeObj.label,
    frequency,
    factor,
    factorUnit: modeObj.unit,
    formula: `${validation.value} km × ${factor} ${modeObj.unit}`,
    emissions: Math.round(tripEmissions * 100) / 100,
    normalizedMonthly: Math.round(normalizedMonthly * 100) / 100,
    source: modeObj.source,
    error: null
  };
}

/**
 * Calculates Fuel Emissions
 * Formula: litres * factor
 */
export function calculateFuelEmissions(litres, fuelType = 'petrol', period = 'monthly', customFactor = null) {
  const validation = validateInput(litres, 'Fuel quantity');
  if (!validation.valid) return { error: validation.error, emissions: 0, normalizedMonthly: 0 };

  const fuelObj = DEFAULT_EMISSION_FACTORS.fuel[fuelType] || DEFAULT_EMISSION_FACTORS.fuel.petrol;
  const factor = customFactor !== null ? customFactor : fuelObj.factor;
  const directEmissions = validation.value * factor;
  const multiplier = PERIOD_MULTIPLIERS[period] || 1.0;
  const normalizedMonthly = period === 'one_time' ? directEmissions : directEmissions * multiplier;

  return {
    rawInput: validation.value,
    unit: fuelType === 'cng' ? 'kg' : 'Litres',
    fuelType,
    fuelLabel: fuelObj.label,
    period,
    factor,
    factorUnit: fuelObj.unit,
    formula: `${validation.value} ${fuelType === 'cng' ? 'kg' : 'L'} × ${factor} ${fuelObj.unit}`,
    emissions: Math.round(directEmissions * 100) / 100,
    normalizedMonthly: Math.round(normalizedMonthly * 100) / 100,
    source: fuelObj.source,
    error: null
  };
}

/**
 * Calculates Waste Emissions
 * Formula: kg * factor
 */
export function calculateWasteEmissions(kg, wasteType = 'mixed', period = 'monthly', customFactor = null) {
  const validation = validateInput(kg, 'Waste amount');
  if (!validation.valid) return { error: validation.error, emissions: 0, normalizedMonthly: 0 };

  const wasteObj = DEFAULT_EMISSION_FACTORS.waste[wasteType] || DEFAULT_EMISSION_FACTORS.waste.mixed;
  const factor = customFactor !== null ? customFactor : wasteObj.factor;
  const directEmissions = validation.value * factor;
  const multiplier = PERIOD_MULTIPLIERS[period] || 1.0;
  const normalizedMonthly = period === 'one_time' ? directEmissions : directEmissions * multiplier;

  return {
    rawInput: validation.value,
    unit: 'kg',
    wasteType,
    wasteLabel: wasteObj.label,
    period,
    factor,
    factorUnit: wasteObj.unit,
    formula: `${validation.value} kg × ${factor} ${wasteObj.unit}`,
    emissions: Math.round(directEmissions * 100) / 100,
    normalizedMonthly: Math.round(normalizedMonthly * 100) / 100,
    source: wasteObj.source,
    error: null
  };
}

/**
 * Calculate Comprehensive Total
 */
export function calculateCombinedFootprint({
  electricity = { kwh: 0, period: 'monthly' },
  transportation = { km: 0, mode: 'car_petrol', frequency: 'weekly' },
  fuel = { litres: 0, fuelType: 'petrol', period: 'monthly' },
  waste = { kg: 0, wasteType: 'mixed', period: 'monthly' }
}) {
  const elec = calculateElectricityEmissions(electricity.kwh, electricity.period);
  const trans = calculateTransportEmissions(transportation.km, transportation.mode, transportation.frequency);
  const fl = calculateFuelEmissions(fuel.litres, fuel.fuelType, fuel.period);
  const wst = calculateWasteEmissions(waste.kg, waste.wasteType, waste.period);

  const totalEmissions = Math.round((elec.emissions + trans.emissions + fl.emissions + wst.emissions) * 100) / 100;
  const totalMonthlyNormalized = Math.round(
    (elec.normalizedMonthly + trans.normalizedMonthly + fl.normalizedMonthly + wst.normalizedMonthly) * 100
  ) / 100;

  const breakdown = [
    { category: 'Electricity', emissions: elec.normalizedMonthly, direct: elec.emissions, color: '#f59e0b', share: 0 },
    { category: 'Transportation', emissions: trans.normalizedMonthly, direct: trans.emissions, color: '#3b82f6', share: 0 },
    { category: 'Fuel', emissions: fl.normalizedMonthly, direct: fl.emissions, color: '#ef4444', share: 0 },
    { category: 'Waste', emissions: wst.normalizedMonthly, direct: wst.emissions, color: '#10b981', share: 0 }
  ];

  if (totalMonthlyNormalized > 0) {
    breakdown.forEach(item => {
      item.share = Math.round((item.emissions / totalMonthlyNormalized) * 100);
    });
  }

  // Sort to find highest emission category
  const sorted = [...breakdown].sort((a, b) => b.emissions - a.emissions);
  const highestCategory = sorted[0].emissions > 0 ? sorted[0] : null;

  return {
    totalEmissions,
    totalMonthlyNormalized,
    breakdown,
    highestCategory,
    details: { electricity: elec, transportation: trans, fuel: fl, waste: wst }
  };
}
