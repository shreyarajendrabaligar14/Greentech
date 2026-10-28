import React from 'react';
import { X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { DEFAULT_EMISSION_FACTORS } from '../services/emissionFactors';

export default function FactorInfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 to-[#0b2e19] text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold tracking-tight text-white">Emission Factors & Methodology</h2>
            </div>
            <p className="text-xs text-emerald-300/80 mt-1">
              Documented calculation factors, units, and citation sources
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="p-4 bg-amber-50 border-b border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Transparency Disclaimer:</span> Default factors provided here represent published benchmark estimates (such as DEFRA 2023, India CEA 2023, and US EPA WARM). They are marked as estimates and are configurable in settings to reflect specific regional grids or fuel mixes.
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          {/* Electricity */}
          <section>
            <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Electricity Consumption
            </h3>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Standard Factor:</span>
                <span className="font-bold text-slate-800">{DEFAULT_EMISSION_FACTORS.electricity.factor} {DEFAULT_EMISSION_FACTORS.electricity.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Formula:</span>
                <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{DEFAULT_EMISSION_FACTORS.electricity.formula}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Reference Source:</span>
                <span className="text-slate-600 italic">{DEFAULT_EMISSION_FACTORS.electricity.source}</span>
              </div>
            </div>
          </section>

          {/* Transportation */}
          <section>
            <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Transportation Modes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(DEFAULT_EMISSION_FACTORS.transportation).map(([key, val]) => (
                <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800">{val.label}</p>
                  <p className="text-emerald-700 font-semibold mt-0.5">{val.factor} {val.unit}</p>
                  <p className="font-mono text-[11px] text-slate-500 mt-1">{val.formula}</p>
                  <p className="text-[10px] text-slate-400 mt-1 italic">{val.source}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Fuel */}
          <section>
            <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Fuel Combustion
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(DEFAULT_EMISSION_FACTORS.fuel).map(([key, val]) => (
                <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800">{val.label}</p>
                  <p className="text-rose-700 font-semibold mt-0.5">{val.factor} {val.unit}</p>
                  <p className="font-mono text-[11px] text-slate-500 mt-1">{val.formula}</p>
                  <p className="text-[10px] text-slate-400 mt-1 italic">{val.source}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Waste */}
          <section>
            <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Waste Generation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(DEFAULT_EMISSION_FACTORS.waste).map(([key, val]) => (
                <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-800">{val.label}</p>
                  <p className="text-emerald-700 font-semibold mt-0.5">{val.factor} {val.unit}</p>
                  <p className="font-mono text-[11px] text-slate-500 mt-1">{val.formula}</p>
                  <p className="text-[10px] text-slate-400 mt-1 italic">{val.source}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-colors"
          >
            Close Methodology
          </button>
        </div>
      </div>
    </div>
  );
}
