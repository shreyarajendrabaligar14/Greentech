import React from 'react';
import { Leaf, PlusCircle, BookOpen } from 'lucide-react';

export default function EmptyState({ onAction, onOpenFactors }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-emerald-300 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 mb-5 shadow-inner">
        <Leaf className="w-8 h-8 animate-bounce" />
      </div>

      <h3 className="text-xl font-bold text-slate-800">
        No Carbon Activity Logged Yet
      </h3>

      <p className="text-slate-500 text-sm mt-2 leading-relaxed max-w-md mx-auto">
        Your carbon footprint overview is empty. Start by logging your electricity bills, commuting distances, fuel fills, or waste generation.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          id="empty-state-calc-btn"
          onClick={onAction}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-md shadow-emerald-700/20 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Calculate My Footprint</span>
        </button>

        <button
          onClick={onOpenFactors}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 border border-slate-200 transition-colors"
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Explore Emission Factors</span>
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Electricity</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5">0.82 kg/kWh</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Commute</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5">Car, Metro, Bus</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Fuels</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5">Petrol, LPG, Diesel</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Solid Waste</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5">Food, Plastics, Paper</p>
        </div>
      </div>
    </div>
  );
}
