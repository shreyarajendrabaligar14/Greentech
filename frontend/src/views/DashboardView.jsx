import React from 'react';
import {
  Zap,
  Car,
  Flame,
  TrendingDown,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import EquivalenceCard from '../components/EquivalenceCard';
import { formatDate } from '../utils/formatters';

const CATEGORY_COLORS = {
  Electricity: '#f59e0b',
  Transportation: '#3b82f6',
  Fuel: '#ef4444',
  Waste: '#10b981',
};

export default function DashboardView({
  summary,
  activities = [],
  targets,
  challenges = [],
  onNavigate,
  onOpenFactors,
  isLoading = false
}) {
  const goTo = (path) => {
    if (onNavigate) {
      onNavigate(path.startsWith('/') ? path : `/${path}`);
    }
  };

  const hasData = activities && activities.length > 0;

  // Empty state handling
  if (!hasData && !isLoading) {
    return (
      <div className="py-6 animate-fade-in">
        <EmptyState
          onAction={() => goTo('/calculator')}
          onOpenFactors={onOpenFactors}
        />
      </div>
    );
  }

  // Calculate metrics derived from real data
  const totalEmissions = summary?.total_emissions || 0;
  const electricityEmissions = summary?.electricity_emissions || 0;
  const transportEmissions = summary?.transportation_emissions || 0;
  const fuelEmissions = summary?.fuel_emissions || 0;
  const wasteEmissions = summary?.waste_emissions || 0;

  // Category Pie Data
  const pieData = [
    { name: 'Electricity', value: electricityEmissions, color: CATEGORY_COLORS.Electricity },
    { name: 'Transportation', value: transportEmissions, color: CATEGORY_COLORS.Transportation },
    { name: 'Fuel', value: fuelEmissions, color: CATEGORY_COLORS.Fuel },
    { name: 'Waste', value: wasteEmissions, color: CATEGORY_COLORS.Waste },
  ].filter(item => item.value > 0);

  // Historical Monthly Trend Data
  const trendData = summary?.monthly_trends || [];

  // Sustainability Score (Calculated transparently: 100 - emissions penalty + challenge bonus)
  const completedChallengesCount = challenges.filter(c => c.completed).length;
  const baseScore = Math.max(20, Math.min(95, Math.round(100 - (totalEmissions / 40) + (completedChallengesCount * 5))));
  const sustainabilityScore = totalEmissions > 0 ? baseScore : 85;

  // Determine score label & color
  const getScoreBadge = (score) => {
    if (score >= 80) return { label: 'Eco Champion (Tier A)', bg: 'bg-emerald-100 text-emerald-800' };
    if (score >= 60) return { label: 'Moderate Impact (Tier B)', bg: 'bg-blue-100 text-blue-800' };
    return { label: 'High Footprint (Tier C)', bg: 'bg-amber-100 text-amber-800' };
  };

  const scoreBadge = getScoreBadge(sustainabilityScore);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-[#092b17] via-[#0f3d23] to-[#14532d] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Carbon Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Environmental Impact Overview
            </h2>
            <p className="text-emerald-200/80 text-xs sm:text-sm max-w-xl">
              Derived from {activities.length} recorded emission activities. Continuously monitor your footprint and track climate targets.
            </p>
          </div>

          {/* Sustainability Score Gauge Pill */}
          <div className="bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/20 flex items-center gap-4 shrink-0">
            <div className="relative flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-emerald-950"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray={163.36}
                  strokeDashoffset={163.36 - (163.36 * sustainabilityScore) / 100}
                  strokeLinecap="round"
                  className="text-emerald-400 transition-all duration-1000 ease-out"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-lg font-black text-white">{sustainabilityScore}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Sustainability Score</p>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${scoreBadge.bg}`}>
                {scoreBadge.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Footprint"
          value={totalEmissions.toLocaleString()}
          unit="kg CO2e"
          icon={Layers}
          trend={summary?.change_pct ?? null}
          trendLabel="vs previous log"
          color="emerald"
          isLoading={isLoading}
        />
        <StatCard
          title="Electricity"
          value={electricityEmissions.toLocaleString()}
          unit="kg CO2e"
          icon={Zap}
          subtitle="Grid generation impact"
          color="amber"
          isLoading={isLoading}
        />
        <StatCard
          title="Transportation"
          value={transportEmissions.toLocaleString()}
          unit="kg CO2e"
          icon={Car}
          subtitle="Commutes & transit"
          color="blue"
          isLoading={isLoading}
        />
        <StatCard
          title="Fuel & Waste"
          value={(fuelEmissions + wasteEmissions).toLocaleString()}
          unit="kg CO2e"
          icon={Flame}
          subtitle="Direct burn & landfills"
          color="rose"
          isLoading={isLoading}
        />
      </div>

      {/* Real-World Environmental Equivalents */}
      <EquivalenceCard totalKg={totalEmissions} />

      {/* Charts Section: Category Contribution + Monthly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Contribution Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Category Breakdown</h3>
                <p className="text-xs text-slate-500">Contribution across emission domains</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                Actual Stored
              </span>
            </div>

            {pieData.length > 0 ? (
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`${Number(val).toLocaleString()} kg CO2e`, 'Emissions']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                No categorical data
              </div>
            )}
          </div>

          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100">
            {pieData.map((item) => {
              const pct = totalEmissions > 0 ? Math.round((item.value / totalEmissions) * 100) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="font-semibold text-slate-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Emissions Trend Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Emissions Timeline</h3>
                <p className="text-xs text-slate-500">Historical trend from verified user activity</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Tracking Target</span>
              </div>
            </div>

            <div className="h-64">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(val) => [`${Number(val).toLocaleString()} kg CO2e`, 'Emissions']}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="emissions"
                      stroke="#059669"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorTrend)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Log at least two activities to visualize timeline trend
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Reduction Target: <strong>{targets?.reduction_percentage || 20}% by {targets?.target_year || '2026'}</strong></span>
            <button
              onClick={() => goTo('/analytics')}
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>Explore In-Depth Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activities Table & Quick Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Activity Records</h3>
            <p className="text-xs text-slate-500">Stored in local SQLite database & localStorage</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goTo('/calculator')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log New Record</span>
            </button>
            <button
              onClick={() => goTo('/progress')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <span>View All History</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Title / Label</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Electricity</th>
                <th className="py-3 px-4">Transport</th>
                <th className="py-3 px-4">Fuel & Waste</th>
                <th className="py-3 px-4 text-right">Total Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {activities.slice(0, 5).map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {act.title}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{formatDate(act.date)}</td>
                  <td className="py-3.5 px-4 text-amber-700 font-semibold">{act.electricity_emissions} kg</td>
                  <td className="py-3.5 px-4 text-blue-700 font-semibold">{act.transportation_emissions} kg</td>
                  <td className="py-3.5 px-4 text-slate-700 font-semibold">
                    {(act.fuel_emissions + act.waste_emissions).toFixed(1)} kg
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                    {act.total_emissions.toLocaleString()} kg CO2e
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
