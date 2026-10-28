import React, { useState, useMemo } from 'react';
import {
  Download,
  AlertTriangle,
  Zap,
  Flame,
  Globe2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { exportToCSV, formatDate } from '../utils/formatters';

export default function AnalyticsView({ activities = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('category'); // 'category' or 'scopes'

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchesSearch = act.title.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'electricity') return act.electricity_emissions > 0;
      if (selectedCategory === 'transportation') return act.transportation_emissions > 0;
      if (selectedCategory === 'fuel') return act.fuel_emissions > 0;
      if (selectedCategory === 'waste') return act.waste_emissions > 0;
      return true;
    });
  }, [activities, selectedCategory, searchTerm]);

  // Category totals
  const categoryTotals = useMemo(() => {
    let elec = 0, trans = 0, fuel = 0, waste = 0;
    activities.forEach(a => {
      elec += a.electricity_emissions || 0;
      trans += a.transportation_emissions || 0;
      fuel += a.fuel_emissions || 0;
      waste += a.waste_emissions || 0;
    });
    return [
      { name: 'Electricity', emissions: Math.round(elec * 10) / 10, color: '#f59e0b' },
      { name: 'Transportation', emissions: Math.round(trans * 10) / 10, color: '#3b82f6' },
      { name: 'Fuel', emissions: Math.round(fuel * 10) / 10, color: '#ef4444' },
      { name: 'Waste', emissions: Math.round(waste * 10) / 10, color: '#10b981' },
    ];
  }, [activities]);

  // GHG Protocol Scopes Aggregations:
  // Scope 1: Direct fuel burning
  // Scope 2: Purchased grid electricity
  // Scope 3: Value chain (commuting & landfill waste)
  const scopesTotals = useMemo(() => {
    let scope1 = 0, scope2 = 0, scope3 = 0;
    activities.forEach(a => {
      scope1 += a.fuel_emissions || 0;
      scope2 += a.electricity_emissions || 0;
      scope3 += (a.transportation_emissions || 0) + (a.waste_emissions || 0);
    });
    const total = scope1 + scope2 + scope3;
    return [
      {
        scope: 'Scope 1: Direct Emissions',
        subtext: 'Direct fossil fuel combustion (petrol, diesel, heating/cooking gas)',
        emissions: Math.round(scope1 * 10) / 10,
        color: '#ef4444',
        share: total > 0 ? Math.round((scope1 / total) * 100) : 0,
        icon: Flame
      },
      {
        scope: 'Scope 2: Indirect Energy',
        subtext: 'Purchased grid electricity generation emissions',
        emissions: Math.round(scope2 * 10) / 10,
        color: '#f59e0b',
        share: total > 0 ? Math.round((scope2 / total) * 100) : 0,
        icon: Zap
      },
      {
        scope: 'Scope 3: Value Chain',
        subtext: 'Commuter transit vehicles, public transit, and solid waste decomposition',
        emissions: Math.round(scope3 * 10) / 10,
        color: '#10b981',
        share: total > 0 ? Math.round((scope3 / total) * 100) : 0,
        icon: Globe2
      },
    ];
  }, [activities]);

  // Highest emission category
  const sortedCategories = [...categoryTotals].sort((a, b) => b.emissions - a.emissions);
  const highestCategory = sortedCategories[0]?.emissions > 0 ? sortedCategories[0] : null;

  // Bar chart timeline data
  const chronologicalData = useMemo(() => {
    return [...filteredActivities]
      .reverse()
      .map(act => ({
        date: formatDate(act.date),
        title: act.title,
        Electricity: act.electricity_emissions,
        Transportation: act.transportation_emissions,
        Fuel: act.fuel_emissions,
        Waste: act.waste_emissions,
        Total: act.total_emissions
      }));
  }, [filteredActivities]);

  const handleExportCSV = () => {
    const rows = activities.map(a => ({
      ID: a.id,
      Date: a.date,
      Title: a.title,
      'Electricity (kg CO2e)': a.electricity_emissions,
      'Transportation (kg CO2e)': a.transportation_emissions,
      'Fuel (kg CO2e)': a.fuel_emissions,
      'Waste (kg CO2e)': a.waste_emissions,
      'Total Emissions (kg CO2e)': a.total_emissions,
    }));
    exportToCSV(rows, `carbontrack_emissions_report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Analytics Header & Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Emission Analytics & Drilldowns
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Comparative multi-source breakdown across verified logs
          </p>
        </div>

        {/* Action Controls: View Switcher, Filter, & CSV */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('category')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'category'
                  ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Category View
            </button>
            <button
              onClick={() => setViewMode('scopes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'scopes'
                  ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              GHG Scopes (1, 2, 3)
            </button>
          </div>

          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-slate-700"
          >
            <option value="all">All Categories</option>
            <option value="electricity">Electricity</option>
            <option value="transportation">Transportation</option>
            <option value="fuel">Fuel</option>
            <option value="waste">Waste</option>
          </select>

          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Report</span>
          </button>
        </div>
      </div>

      {/* Highest Emission Category Callout Banner */}
      {highestCategory && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900">
              Primary Emission Hotspot Identified: {highestCategory.name}
            </h4>
            <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
              <strong>{highestCategory.name}</strong> accounts for{' '}
              <strong>{highestCategory.emissions.toLocaleString()} kg CO2e</strong> across your records. Targeting this domain yields the highest return on reduction efforts. Check the Reduction AI tab for recommended interventions.
            </p>
          </div>
        </div>
      )}

      {/* Scopes 1, 2, 3 Cards (When viewMode is 'scopes') */}
      {viewMode === 'scopes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {scopesTotals.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.scope} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: item.color }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                    {item.share}% Share
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">{item.scope}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.subtext}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900">{item.emissions.toLocaleString()}</span>
                  <span className="text-xs font-bold text-slate-500">kg CO2e</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Stacked Bar Timeline Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Activity Comparison by Category
              </h3>
              <p className="text-xs text-slate-500">Breakdown per recorded assessment</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
              {filteredActivities.length} logs
            </span>
          </div>

          <div className="h-80">
            {chronologicalData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chronologicalData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="title" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val, name) => [`${Number(val).toLocaleString()} kg CO2e`, name]}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Electricity" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Transportation" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Fuel" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Waste" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No matching records to display
              </div>
            )}
          </div>
        </div>

        {/* Category Share Distribution Bar (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Total Category Share
            </h3>
            <p className="text-xs text-slate-500 mb-6">Cumulative impact per source</p>

            <div className="space-y-4">
              {categoryTotals.map((cat) => {
                const totalAll = categoryTotals.reduce((acc, c) => acc + c.emissions, 0);
                const pct = totalAll > 0 ? Math.round((cat.emissions / totalAll) * 100) : 0;
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                        {cat.name}
                      </span>
                      <span className="text-slate-900">{cat.emissions.toLocaleString()} kg ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-500 text-center">
            Standard unit: <strong>kg CO2e</strong> (1,000 kg = 1 Metric Tonne)
          </div>
        </div>
      </div>
    </div>
  );
}
