import React, { useState } from 'react';
import {
  Zap,
  Car,
  Flame,
  Trash2,
  Calculator,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
  Play
} from 'lucide-react';
import { DEFAULT_EMISSION_FACTORS } from '../services/emissionFactors';
import {
  calculateElectricityEmissions,
  calculateTransportEmissions,
  calculateFuelEmissions,
  calculateWasteEmissions,
  calculateCombinedFootprint
} from '../utils/calculations';
import { api } from '../services/api';

export default function CalculatorView({ onSaveActivity, onOpenFactors }) {
  // Form states
  const [electricity, setElectricity] = useState({
    kwh: '250',
    period: 'monthly'
  });

  const [transportation, setTransportation] = useState({
    km: '150',
    mode: 'car_petrol',
    frequency: 'weekly'
  });

  const [fuel, setFuel] = useState({
    litres: '30',
    fuelType: 'petrol',
    period: 'monthly'
  });

  const [waste, setWaste] = useState({
    kg: '25',
    wasteType: 'mixed',
    period: 'monthly'
  });

  const [activityTitle, setActivityTitle] = useState('Monthly Footprint Audit');
  const [saveStatus, setSaveStatus] = useState({ state: 'idle', message: '' });
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcFeedback, setCalcFeedback] = useState(null);

  // Client-side calculations
  const elecCalc = calculateElectricityEmissions(electricity.kwh, electricity.period);
  const transCalc = calculateTransportEmissions(transportation.km, transportation.mode, transportation.frequency);
  const fuelCalc = calculateFuelEmissions(fuel.litres, fuel.fuelType, fuel.period);
  const wasteCalc = calculateWasteEmissions(waste.kg, waste.wasteType, waste.period);

  const combined = calculateCombinedFootprint({
    electricity,
    transportation,
    fuel,
    waste
  });

  // Working Calculate Button Handler (connects to FastAPI backend /api/calculate)
  const handleCalculate = async () => {
    if (elecCalc.error || transCalc.error || fuelCalc.error || wasteCalc.error) {
      setCalcFeedback({
        type: 'error',
        message: 'Please resolve negative or invalid numeric inputs before calculating.'
      });
      return;
    }

    setIsCalculating(true);
    setCalcFeedback(null);

    try {
      // Connect to FastAPI backend /api/calculate
      const payload = {
        electricity: { kwh: Number(electricity.kwh), period: electricity.period },
        transportation: { km: Number(transportation.km), mode: transportation.mode, frequency: transportation.frequency },
        fuel: { litres: Number(fuel.litres), fuel_type: fuel.fuelType, period: fuel.period },
        waste: { kg: Number(waste.kg), waste_type: waste.wasteType, period: waste.period },
      };

      const serverRes = await api.calculate(payload).catch(() => null);

      setIsCalculating(false);
      setCalcFeedback({
        type: 'success',
        message: serverRes
          ? `Calculation verified via FastAPI backend: ${serverRes.total_monthly_normalized} kg CO2e / month`
          : `Calculated successfully: ${combined.totalMonthlyNormalized} kg CO2e / month`
      });

      // Clear feedback after 4 seconds
      setTimeout(() => setCalcFeedback(null), 4000);
    } catch {
      setIsCalculating(false);
      setCalcFeedback({
        type: 'success',
        message: `Calculated locally: ${combined.totalMonthlyNormalized} kg CO2e / month`
      });
      setTimeout(() => setCalcFeedback(null), 4000);
    }
  };

  // Handle preset quick fills for testing / demo
  const applyPreset = (presetKey) => {
    if (presetKey === 'student') {
      setActivityTitle('Student Commuter Profile');
      setElectricity({ kwh: '85', period: 'monthly' });
      setTransportation({ km: '60', mode: 'bus', frequency: 'weekly' });
      setFuel({ litres: '0', fuelType: 'petrol', period: 'monthly' });
      setWaste({ kg: '12', wasteType: 'mixed', period: 'monthly' });
    } else if (presetKey === 'household') {
      setActivityTitle('Average Urban Household');
      setElectricity({ kwh: '320', period: 'monthly' });
      setTransportation({ km: '180', mode: 'car_petrol', frequency: 'weekly' });
      setFuel({ litres: '45', fuelType: 'petrol', period: 'monthly' });
      setWaste({ kg: '35', wasteType: 'mixed', period: 'monthly' });
    } else if (presetKey === 'college_dept') {
      setActivityTitle('College Science Lab & Wing');
      setElectricity({ kwh: '1850', period: 'monthly' });
      setTransportation({ km: '400', mode: 'bus', frequency: 'weekly' });
      setFuel({ litres: '80', fuelType: 'diesel', period: 'monthly' });
      setWaste({ kg: '120', wasteType: 'mixed', period: 'monthly' });
    }
    setCalcFeedback({ type: 'success', message: 'Demo preset values applied. Click "Calculate" to review.' });
    setTimeout(() => setCalcFeedback(null), 3000);
  };

  const resetForm = () => {
    setElectricity({ kwh: '0', period: 'monthly' });
    setTransportation({ km: '0', mode: 'car_petrol', frequency: 'weekly' });
    setFuel({ litres: '0', fuelType: 'petrol', period: 'monthly' });
    setWaste({ kg: '0', wasteType: 'mixed', period: 'monthly' });
    setActivityTitle('New Carbon Assessment');
    setSaveStatus({ state: 'idle', message: '' });
    setCalcFeedback(null);
  };

  const handleSave = async () => {
    if (elecCalc.error || transCalc.error || fuelCalc.error || wasteCalc.error) {
      setSaveStatus({ state: 'error', message: 'Please correct invalid or negative inputs before saving.' });
      return;
    }

    if (combined.totalMonthlyNormalized <= 0 && combined.totalEmissions <= 0) {
      setSaveStatus({ state: 'error', message: 'Calculated emission total is 0. Please enter at least one non-zero activity.' });
      return;
    }

    setSaveStatus({ state: 'saving', message: 'Saving calculation to database...' });

    const currentDate = new Date().toISOString().split('T')[0];
    const newRecord = {
      title: activityTitle || 'Footprint Record',
      date: currentDate,
      total_emissions: combined.totalMonthlyNormalized,
      electricity_emissions: elecCalc.normalizedMonthly,
      transportation_emissions: transCalc.normalizedMonthly,
      fuel_emissions: fuelCalc.normalizedMonthly,
      waste_emissions: wasteCalc.normalizedMonthly,
      details: {
        electricity: { kwh: Number(electricity.kwh), period: electricity.period, direct: elecCalc.emissions },
        transportation: { km: Number(transportation.km), mode: transportation.mode, frequency: transportation.frequency, direct: transCalc.emissions },
        fuel: { litres: Number(fuel.litres), fuelType: fuel.fuelType, period: fuel.period, direct: fuelCalc.emissions },
        waste: { kg: Number(waste.kg), wasteType: waste.wasteType, period: waste.period, direct: wasteCalc.emissions }
      }
    };

    try {
      if (onSaveActivity) {
        await onSaveActivity(newRecord);
      }
      setSaveStatus({ state: 'success', message: 'Activity record successfully logged!' });
      setTimeout(() => {
        setSaveStatus({ state: 'idle', message: '' });
      }, 3500);
    } catch (err) {
      setSaveStatus({ state: 'error', message: err.message || 'Failed to save record.' });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner & Quick Presets */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#0a331c] to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-3">
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              GHG Protocol Accounting Standards
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Multi-Source Carbon Calculator
            </h2>
            <p className="text-emerald-200/80 text-sm mt-1 max-w-xl">
              Accurately estimate emissions from electricity consumption, vehicular commuting, direct fuel burning, and municipal solid waste.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="bg-black/25 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-500/20">
            <p className="text-xs font-semibold text-emerald-300/80 uppercase tracking-wider mb-2">
              Demonstration Presets:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                id="preset-student"
                type="button"
                onClick={() => applyPreset('student')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-emerald-500/30 text-xs font-medium text-emerald-100 border border-white/10 transition-colors"
              >
                🎒 Student Commuter
              </button>
              <button
                id="preset-household"
                type="button"
                onClick={() => applyPreset('household')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-emerald-500/30 text-xs font-medium text-emerald-100 border border-white/10 transition-colors"
              >
                🏡 Household
              </button>
              <button
                id="preset-college"
                type="button"
                onClick={() => applyPreset('college_dept')}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-emerald-500/30 text-xs font-medium text-emerald-100 border border-white/10 transition-colors"
              >
                🏫 College Wing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Illustrative Factor Disclaimer Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Illustrative Factors Notice:</strong> Default emission factors are estimates derived from CEA 2023 grid baselines and DEFRA 2023 data. They represent illustrative benchmark estimates and are not certified official lab measurements.
          </span>
        </div>
        <button
          onClick={onOpenFactors}
          className="underline font-bold text-emerald-800 hover:text-emerald-950 shrink-0 ml-3"
        >
          View Methodology
        </button>
      </div>

      {/* Main Grid: Form on Left, Live Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Section: Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Assessment Meta Header */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Assessment Title / Label
              </label>
              <input
                id="input-activity-title"
                type="text"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
                placeholder="e.g. October 2026 Campus Audit"
                className="w-full px-3.5 py-2 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
            <button
              onClick={resetForm}
              className="w-full sm:w-auto self-end px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* 1. Electricity Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Electricity Consumption</h3>
                  <p className="text-xs text-slate-500">Grid power consumption from utility meters</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                Factor: 0.82 kg/kWh
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Consumption (kWh)
                </label>
                <input
                  id="input-electricity-kwh"
                  type="number"
                  min="0"
                  step="any"
                  value={electricity.kwh}
                  onChange={(e) => setElectricity({ ...electricity, kwh: e.target.value })}
                  placeholder="e.g. 250"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    elecCalc.error
                      ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/50'
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
                {elecCalc.error && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {elecCalc.error}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Billing Period
                </label>
                <select
                  id="select-electricity-period"
                  value={electricity.period}
                  onChange={(e) => setElectricity({ ...electricity, period: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="daily">Daily Average</option>
                  <option value="weekly">Weekly Average</option>
                  <option value="monthly">Monthly Total (Standard)</option>
                  <option value="yearly">Yearly Total</option>
                  <option value="one_time">Single Meter Log</option>
                </select>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-[11px]">{elecCalc.formula}</span>
              </div>
              <div className="font-bold text-slate-800">
                Monthly: <span className="text-amber-600">{elecCalc.normalizedMonthly} kg CO2e</span>
              </div>
            </div>
          </div>

          {/* 2. Transportation Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Transportation & Commuting</h3>
                  <p className="text-xs text-slate-500">Commute distance, vehicle mode, and travel frequency</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                {DEFAULT_EMISSION_FACTORS.transportation[transportation.mode]?.factor || 0.17} kg/km
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Distance (Kilometres)
                </label>
                <input
                  id="input-transport-km"
                  type="number"
                  min="0"
                  step="any"
                  value={transportation.km}
                  onChange={(e) => setTransportation({ ...transportation, km: e.target.value })}
                  placeholder="e.g. 150"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    transCalc.error
                      ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/50'
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
                {transCalc.error && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {transCalc.error}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Vehicle / Mode
                </label>
                <select
                  id="select-transport-mode"
                  value={transportation.mode}
                  onChange={(e) => setTransportation({ ...transportation, mode: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="car_petrol">Car (Petrol/Gasoline)</option>
                  <option value="car_diesel">Car (Diesel)</option>
                  <option value="car_ev">Electric Car (EV)</option>
                  <option value="motorcycle">Motorcycle / Scooter</option>
                  <option value="bus">Public Transit Bus</option>
                  <option value="train">Metro / Train</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Frequency
                </label>
                <select
                  id="select-transport-freq"
                  value={transportation.frequency}
                  onChange={(e) => setTransportation({ ...transportation, frequency: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="daily">Daily Commute</option>
                  <option value="weekly">Weekly Routine</option>
                  <option value="monthly">Monthly Total</option>
                  <option value="one_time">Single Trip</option>
                </select>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-[11px]">{transCalc.formula}</span>
              </div>
              <div className="font-bold text-slate-800">
                Monthly: <span className="text-blue-600">{transCalc.normalizedMonthly} kg CO2e</span>
              </div>
            </div>
          </div>

          {/* 3. Fuel Combustion Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Direct Fuel Consumption</h3>
                  <p className="text-xs text-slate-500">Heating, cooking LPG, generator diesel, or machinery fuel</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                {DEFAULT_EMISSION_FACTORS.fuel[fuel.fuelType]?.factor || 2.31} kg/L
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Quantity ({fuel.fuelType === 'cng' ? 'kg' : 'Litres'})
                </label>
                <input
                  id="input-fuel-litres"
                  type="number"
                  min="0"
                  step="any"
                  value={fuel.litres}
                  onChange={(e) => setFuel({ ...fuel, litres: e.target.value })}
                  placeholder="e.g. 30"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    fuelCalc.error
                      ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/50'
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
                {fuelCalc.error && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fuelCalc.error}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Fuel Type
                </label>
                <select
                  id="select-fuel-type"
                  value={fuel.fuelType}
                  onChange={(e) => setFuel({ ...fuel, fuelType: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="petrol">Petrol (Gasoline)</option>
                  <option value="diesel">Diesel</option>
                  <option value="lpg">LPG (Cylinder/Tank)</option>
                  <option value="cng">CNG (Natural Gas)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Period
                </label>
                <select
                  id="select-fuel-period"
                  value={fuel.period}
                  onChange={(e) => setFuel({ ...fuel, period: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="daily">Daily Refill</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="one_time">Single Fill / Event</option>
                </select>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-[11px]">{fuelCalc.formula}</span>
              </div>
              <div className="font-bold text-slate-800">
                Monthly: <span className="text-rose-600">{fuelCalc.normalizedMonthly} kg CO2e</span>
              </div>
            </div>
          </div>

          {/* 4. Waste Generation Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Solid Waste Generation</h3>
                  <p className="text-xs text-slate-500">Methane & decomposition lifecycle emissions from discarded waste</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {DEFAULT_EMISSION_FACTORS.waste[waste.wasteType]?.factor || 0.58} kg/kg
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Waste Amount (Kilograms)
                </label>
                <input
                  id="input-waste-kg"
                  type="number"
                  min="0"
                  step="any"
                  value={waste.kg}
                  onChange={(e) => setWaste({ ...waste, kg: e.target.value })}
                  placeholder="e.g. 25"
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    wasteCalc.error
                      ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/50'
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
                {wasteCalc.error && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {wasteCalc.error}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Waste Stream
                </label>
                <select
                  id="select-waste-type"
                  value={waste.wasteType}
                  onChange={(e) => setWaste({ ...waste, wasteType: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="mixed">Mixed Municipal Solid Waste</option>
                  <option value="food">Organic / Food Waste</option>
                  <option value="plastic">Plastics (Landfilled)</option>
                  <option value="paper">Paper & Packaging</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Period
                </label>
                <select
                  id="select-waste-period"
                  value={waste.period}
                  onChange={(e) => setWaste({ ...waste, period: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="daily">Daily Discards</option>
                  <option value="weekly">Weekly Bags</option>
                  <option value="monthly">Monthly Total</option>
                  <option value="one_time">Single Batch</option>
                </select>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-[11px]">{wasteCalc.formula}</span>
              </div>
              <div className="font-bold text-slate-800">
                Monthly: <span className="text-emerald-600">{wasteCalc.normalizedMonthly} kg CO2e</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Real-time Footprint Summary, Calculate Button, and Save Action (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xl space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                  Calculated Result
                </span>
                <button
                  onClick={onOpenFactors}
                  className="text-xs text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Factors</span>
                </button>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Monthly Footprint
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {combined.totalMonthlyNormalized.toLocaleString()}
                  </span>
                  <span className="text-base font-bold text-emerald-700">kg CO2e / mo</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Annualized equivalent: {(combined.totalMonthlyNormalized * 12 / 1000).toFixed(2)} tonnes CO2e / year
                </p>
              </div>
            </div>

            {/* Category Breakdown Bars */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-xs font-bold text-slate-600 uppercase">
                <span>Category Breakdown</span>
                <span>Share</span>
              </div>

              {combined.breakdown.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      {item.category}
                    </span>
                    <span className="text-slate-900 font-bold">
                      {item.emissions} kg ({item.share}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.share}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Highest Source Callout */}
            {combined.highestCategory && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-slate-800">Primary Driver:</span>{' '}
                  <span className="text-slate-600">
                    {combined.highestCategory.category} contributes {combined.highestCategory.share}% of calculated emissions.
                  </span>
                </div>
              </div>
            )}

            {/* Calculate Button Feedback Banner */}
            {calcFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  calcFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {calcFeedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{calcFeedback.message}</span>
              </div>
            )}

            {/* Save Status / Feedback */}
            {saveStatus.state !== 'idle' && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  saveStatus.state === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : saveStatus.state === 'error'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}
              >
                {saveStatus.state === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                {saveStatus.state === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                {saveStatus.state === 'saving' && <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0"></div>}
                <span>{saveStatus.message}</span>
              </div>
            )}

            {/* Action Buttons: 1. Calculate Emissions, 2. Save to History */}
            <div className="space-y-2.5">
              <button
                id="btn-calculate"
                type="button"
                onClick={handleCalculate}
                disabled={isCalculating}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-slate-800 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {isCalculating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying with Backend API...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    <span>Calculate Emissions</span>
                  </>
                )}
              </button>

              <button
                id="btn-save-activity"
                type="button"
                onClick={handleSave}
                disabled={saveStatus.state === 'saving'}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 via-emerald-700 to-forest-800 hover:from-emerald-500 hover:to-forest-700 shadow-lg shadow-emerald-800/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save to Activity History</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Saved data persists locally and syncs with FastAPI SQLite
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
