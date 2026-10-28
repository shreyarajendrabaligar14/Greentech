/**
 * Documented emission factors used in CarbonTrack AI.
 * Reference sources:
 * - Electricity: CEA (Central Electricity Authority, India 2023 grid baseline ~0.82 kg CO2e/kWh; EPA eGRID US ~0.38 kg/kWh)
 * - Transport: DEFRA 2023 / UK GHG Conversion Factors for Company Reporting
 * - Fuels: IPCC / US EPA Greenhouse Gas Inventory
 * - Waste: US EPA WARM (Waste Reduction Model) & DEFRA standard landfill factors
 * 
 * Note: Default factors are labeled as estimates until verified by regional environmental audits.
 */

export const DEFAULT_EMISSION_FACTORS = {
  electricity: {
    factor: 0.82, // kg CO2e per kWh
    unit: 'kg CO2e / kWh',
    label: 'Grid Electricity (Average)',
    formula: 'Electricity (kWh) × 0.82',
    source: 'CEA Baseline Database & Regional Grid Average (Estimate)',
    description: 'Calculates direct grid generation emissions including generation mix.'
  },
  transportation: {
    car_petrol: {
      factor: 0.170, // kg CO2e per km
      unit: 'kg CO2e / km',
      label: 'Passenger Car (Petrol/Gasoline)',
      formula: 'Distance (km) × 0.170',
      source: 'DEFRA 2023 Average Medium Car'
    },
    car_diesel: {
      factor: 0.165,
      unit: 'kg CO2e / km',
      label: 'Passenger Car (Diesel)',
      formula: 'Distance (km) × 0.165',
      source: 'DEFRA 2023 Medium Diesel Car'
    },
    car_ev: {
      factor: 0.053,
      unit: 'kg CO2e / km',
      label: 'Electric Vehicle (EV)',
      formula: 'Distance (km) × 0.053',
      source: 'Grid-charged EV battery life cycle estimate'
    },
    motorcycle: {
      factor: 0.085,
      unit: 'kg CO2e / km',
      label: 'Motorcycle / Scooter',
      formula: 'Distance (km) × 0.085',
      source: 'DEFRA 2023 Medium Two-Wheeler'
    },
    bus: {
      factor: 0.050,
      unit: 'kg CO2e / pass-km',
      label: 'Public Transit Bus',
      formula: 'Distance (km) × 0.050',
      source: 'DEFRA 2023 Local Bus (per passenger)'
    },
    train: {
      factor: 0.035,
      unit: 'kg CO2e / pass-km',
      label: 'Metro / Rail Transit',
      formula: 'Distance (km) × 0.035',
      source: 'DEFRA 2023 Passenger Rail'
    }
  },
  fuel: {
    petrol: {
      factor: 2.31,
      unit: 'kg CO2e / Litre',
      label: 'Petrol / Gasoline',
      formula: 'Litres × 2.31',
      source: 'IPCC / DEFRA 2023 Standard Fuel'
    },
    diesel: {
      factor: 2.68,
      unit: 'kg CO2e / Litre',
      label: 'Diesel Fuel',
      formula: 'Litres × 2.68',
      source: 'DEFRA 2023 Direct Fuel Combustion'
    },
    lpg: {
      factor: 1.51,
      unit: 'kg CO2e / Litre',
      label: 'LPG (Liquid Petroleum Gas)',
      formula: 'Litres × 1.51 (or ~2.98 kg CO2e / kg)',
      source: 'EPA GHG Factors'
    },
    cng: {
      factor: 2.75,
      unit: 'kg CO2e / kg',
      label: 'CNG (Compressed Natural Gas)',
      formula: 'Kilograms × 2.75',
      source: 'IPCC Mobile Combustion Factors'
    }
  },
  waste: {
    mixed: {
      factor: 0.58,
      unit: 'kg CO2e / kg waste',
      label: 'Mixed Municipal Solid Waste (Landfilled)',
      formula: 'Waste (kg) × 0.58',
      source: 'EPA WARM Model Landfill estimate'
    },
    food: {
      factor: 0.62,
      unit: 'kg CO2e / kg waste',
      label: 'Food / Organic Waste (Landfill anaerobic)',
      formula: 'Waste (kg) × 0.62',
      source: 'IPCC Methane generation from organic waste'
    },
    plastic: {
      factor: 1.43,
      unit: 'kg CO2e / kg waste',
      label: 'Plastic Waste (Non-recycled / Disposed)',
      formula: 'Waste (kg) × 1.43',
      source: 'Plastics Europe LCA & waste management estimates'
    },
    paper: {
      factor: 0.45,
      unit: 'kg CO2e / kg waste',
      label: 'Paper & Cardboard (Landfilled)',
      formula: 'Waste (kg) × 0.45',
      source: 'EPA WARM paper decomposition'
    }
  }
};
