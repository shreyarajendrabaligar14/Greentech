import React from 'react';
import { Trees, Car, Smartphone, Lightbulb } from 'lucide-react';

/**
 * Real-world environmental equivalents for carbon footprints
 * Benchmarks:
 * - 1 mature urban tree absorbs ~21.77 kg CO2/year (US EPA / Arbor Day Foundation)
 * - 1 typical petrol car emits ~0.170 kg CO2e/km (DEFRA 2023)
 * - 1 full smartphone battery charge ~0.00822 kg CO2e (EPA GHG Equivalencies Calculator)
 * - 1 residential 10W LED bulb on 8h/day for a year ~23.9 kg CO2e (CEA Grid)
 */
export default function EquivalenceCard({ totalKg = 0 }) {
  const kg = Math.max(0, Number(totalKg) || 0);
  const treesNeeded = Math.max(1, Math.round((kg * 12) / 21.77)); // annualized trees needed
  const kmEquivalent = Math.round(kg / 0.170);
  const smartPhones = Math.round(kg / 0.00822);
  const ledBulbYears = Math.max(1, Math.round(kg / 23.9));

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-[#0a301b] to-[#051c0f] rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
              Real-World Environmental Equivalents
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-900/60 px-2.5 py-1 rounded-full border border-emerald-700/50">
            EPA Benchmark Multipliers
          </span>
        </div>

        <p className="text-xs text-emerald-200/80 leading-relaxed max-w-2xl">
          Visualizing your monthly footprint of <strong>{kg.toLocaleString()} kg CO2e</strong> in concrete ecological and everyday consumption terms:
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {/* 1. Trees */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:border-emerald-400/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5">
              <Trees className="w-5 h-5" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">{treesNeeded.toLocaleString()}</p>
            <p className="text-[11px] font-bold text-emerald-200 mt-0.5">Trees needed / year</p>
            <p className="text-[10px] text-emerald-400/70 mt-1">to sequester annual output</p>
          </div>

          {/* 2. Car Km */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:border-emerald-400/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2.5">
              <Car className="w-5 h-5" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">{kmEquivalent.toLocaleString()}</p>
            <p className="text-[11px] font-bold text-blue-200 mt-0.5">Kilometres driven</p>
            <p className="text-[10px] text-blue-300/70 mt-1">in an average passenger vehicle</p>
          </div>

          {/* 3. Phone Charges */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:border-emerald-400/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2.5">
              <Smartphone className="w-5 h-5" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">{(smartPhones / 1000).toFixed(1)}k</p>
            <p className="text-[11px] font-bold text-amber-200 mt-0.5">Smartphones charged</p>
            <p className="text-[10px] text-amber-300/70 mt-1">from zero to full capacity</p>
          </div>

          {/* 4. LED Lights */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:border-emerald-400/40 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-2.5">
              <Lightbulb className="w-5 h-5" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">{ledBulbYears.toLocaleString()}</p>
            <p className="text-[11px] font-bold text-emerald-200 mt-0.5">LED Bulbs for a year</p>
            <p className="text-[10px] text-emerald-300/70 mt-1">continuous 8h/day illumination</p>
          </div>
        </div>
      </div>
    </div>
  );
}
