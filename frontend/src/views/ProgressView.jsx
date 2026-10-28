import React, { useState } from 'react';
import {
  Target,
  TrendingDown,
  Trash2,
  Percent
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function ProgressView({
  activities = [],
  targets,
  onSaveTarget,
  onDeleteActivity
}) {
  const [targetPercentage, setTargetPercentage] = useState(targets?.reduction_percentage || 20);
  const [targetYear, setTargetYear] = useState(targets?.target_year || '2026');
  const baselineEmissions = targets?.baseline_emissions || 0;
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [targetMessage, setTargetMessage] = useState('');

  // Calculate actual progress based on recorded data
  const currentLog = activities[0]?.total_emissions || 0;
  const initialLog = activities[activities.length - 1]?.total_emissions || 0;

  // Baseline is either manually specified or the first recorded activity
  const effectiveBaseline = baselineEmissions > 0 ? baselineEmissions : initialLog;
  const targetGoalEmissions = effectiveBaseline * (1 - targetPercentage / 100);

  // Actual reduction achieved so far
  const reductionSoFarKg = effectiveBaseline > 0 ? Math.max(0, effectiveBaseline - currentLog) : 0;
  const reductionPercentageSoFar = effectiveBaseline > 0 ? Math.round(((effectiveBaseline - currentLog) / effectiveBaseline) * 100) : 0;

  // Target progress percentage: (reduction achieved / target reduction) * 100
  const targetReductionRequiredKg = effectiveBaseline * (targetPercentage / 100);
  const progressTowardTarget = targetReductionRequiredKg > 0
    ? Math.min(100, Math.max(0, Math.round((reductionSoFarKg / targetReductionRequiredKg) * 100)))
    : 0;

  const handleUpdateTarget = async (e) => {
    e.preventDefault();
    setIsSavingTarget(true);
    setTargetMessage('');

    try {
      if (onSaveTarget) {
        await onSaveTarget({
          reduction_percentage: Number(targetPercentage),
          target_year: targetYear,
          baseline_emissions: Number(effectiveBaseline)
        });
      }
      setTargetMessage('Climate target successfully updated!');
      setTimeout(() => setTargetMessage(''), 3000);
    } catch (err) {
      setTargetMessage(`Error: ${err.message}`);
    } finally {
      setIsSavingTarget(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Target Setting & Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Target Goal Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Climate Reduction Target
                </h2>
                <p className="text-xs text-slate-500">Benchmark against your initial carbon footprint</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Target Year: {targetYear}
            </span>
          </div>

          {/* Progress Bar Toward Target */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Progress Toward Goal
              </span>
              <span className="text-sm font-extrabold text-emerald-700">
                {progressTowardTarget}% achieved
              </span>
            </div>

            <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-700"
                style={{ width: `${progressTowardTarget}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>Baseline: {effectiveBaseline.toLocaleString()} kg CO2e</span>
              <span>Goal: {targetGoalEmissions.toFixed(0)} kg CO2e (-{targetPercentage}%)</span>
            </div>
          </div>

          {/* Target Update Form */}
          <form onSubmit={handleUpdateTarget} className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Configure Target Parameters
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Target Reduction (%)
                </label>
                <div className="relative">
                  <input
                    id="input-target-percentage"
                    type="number"
                    min="1"
                    max="100"
                    value={targetPercentage}
                    onChange={(e) => setTargetPercentage(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <Percent className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Target Horizon Year
                </label>
                <select
                  id="select-target-year"
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-slate-700"
                >
                  <option value="2026">Hack Fest 2026</option>
                  <option value="2027">2027 Near-term</option>
                  <option value="2030">2030 Net Zero Trajectory</option>
                </select>
              </div>
            </div>

            {targetMessage && (
              <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                {targetMessage}
              </p>
            )}

            <button
              id="btn-update-target"
              type="submit"
              disabled={isSavingTarget}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
            >
              {isSavingTarget ? 'Updating...' : 'Save Reduction Target'}
            </button>
          </form>
        </div>

        {/* Right: Period Comparison Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Period-Over-Period Comparison
            </h3>
            <p className="text-xs text-slate-500">
              Evaluates latest assessment against baseline log
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Baseline Footprint</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {effectiveBaseline.toLocaleString()} kg CO2e
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2 py-1 bg-slate-200 text-slate-700 rounded-lg">
                  Original
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Most Recent Footprint</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {currentLog.toLocaleString()} kg CO2e
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
                  Current
                </span>
              </div>

              {/* Status Delta */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-900">Emissions Trajectory</p>
                    <p className="text-emerald-700 text-[11px]">
                      {reductionPercentageSoFar > 0
                        ? `Reduced by ${reductionPercentageSoFar}% from baseline.`
                        : activities.length <= 1
                        ? 'Log more activities to observe trends.'
                        : 'Current emissions are on par or higher than baseline.'}
                    </p>
                  </div>
                </div>
                {reductionPercentageSoFar > 0 && (
                  <span className="font-black text-emerald-800 text-sm">
                    -{reductionPercentageSoFar}%
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            * Consistent normalized periods prevent mismatched day/month comparisons.
          </div>
        </div>
      </div>

      {/* Historical Activity Records & Deletion Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Stored Historical Activity Logs
            </h3>
            <p className="text-xs text-slate-500">
              Manage individual records. You can delete incorrect entries.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
            {activities.length} total entries
          </span>
        </div>

        {activities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Electricity</th>
                  <th className="py-3 px-4">Transport</th>
                  <th className="py-3 px-4">Fuel</th>
                  <th className="py-3 px-4">Waste</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {activities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{act.title}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(act.date)}</td>
                    <td className="py-3 px-4">{act.electricity_emissions} kg</td>
                    <td className="py-3 px-4">{act.transportation_emissions} kg</td>
                    <td className="py-3 px-4">{act.fuel_emissions} kg</td>
                    <td className="py-3 px-4">{act.waste_emissions} kg</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-800">
                      {act.total_emissions.toLocaleString()} kg CO2e
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        id={`btn-delete-activity-${act.id}`}
                        onClick={() => onDeleteActivity && onDeleteActivity(act.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-slate-400 text-sm">
            No activity records stored yet.
          </p>
        )}
      </div>
    </div>
  );
}
