import React, { useState } from 'react';
import {
  GraduationCap,
  Building2,
  Trophy,
  Info
} from 'lucide-react';

export default function LeaderboardView() {
  const [filterType, setFilterType] = useState('all'); // 'all', 'college', 'organization'

  // Predefined demonstration benchmarks (Explicitly labeled as Sample Demo Data)
  const sampleLeaderboard = [
    {
      id: 1,
      rank: 1,
      name: 'GreenTech Institute of Technology',
      type: 'college',
      location: 'Bengaluru Campus',
      members: 3400,
      perCapitaEmissions: 42.5, // kg CO2e per student/month
      reductionPct: 28,
      sustainabilityScore: 94,
      badge: 'Platinum Eco-Campus'
    },
    {
      id: 2,
      rank: 2,
      name: 'EcoSphere Solutions Corp',
      type: 'organization',
      location: 'Cyber City Hub',
      members: 450,
      perCapitaEmissions: 56.2, // kg CO2e per employee/month
      reductionPct: 24,
      sustainabilityScore: 91,
      badge: 'Gold Verified'
    },
    {
      id: 3,
      rank: 3,
      name: 'National College of Sciences',
      type: 'college',
      location: 'North Campus',
      members: 5100,
      perCapitaEmissions: 61.8,
      reductionPct: 19,
      sustainabilityScore: 88,
      badge: 'Silver Campus'
    },
    {
      id: 4,
      rank: 4,
      name: 'Vertex Cloud & Data Systems',
      type: 'organization',
      location: 'Tech Park East',
      members: 890,
      perCapitaEmissions: 74.0,
      reductionPct: 15,
      sustainabilityScore: 84,
      badge: 'Certified Transition'
    },
    {
      id: 5,
      rank: 5,
      name: 'Apex Polytechnic Institute',
      type: 'college',
      location: 'Central Campus',
      members: 2200,
      perCapitaEmissions: 82.3,
      reductionPct: 11,
      sustainabilityScore: 79,
      badge: 'Active Tracker'
    },
  ];

  const filteredEntries = sampleLeaderboard.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Leaderboard Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-[#0a331c] to-[#082614] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>Comparative Climate Benchmarks</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Institutional Sustainability Leaderboard
            </h2>
            <p className="text-emerald-200/80 text-xs sm:text-sm max-w-xl">
              Benchmark colleges and enterprises on normalized per-capita carbon efficiency, waste diversion, and year-over-year emissions reduction.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="bg-black/30 backdrop-blur-md p-1.5 rounded-2xl border border-emerald-500/20 flex items-center gap-1 self-start md:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-200/80 hover:text-white'
              }`}
            >
              All Peers
            </button>
            <button
              onClick={() => setFilterType('college')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === 'college'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-200/80 hover:text-white'
              }`}
            >
              Colleges
            </button>
            <button
              onClick={() => setFilterType('organization')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === 'organization'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-200/80 hover:text-white'
              }`}
            >
              Organizations
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Demo Data Label Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Hackathon Demonstration Notice:</span> The rankings below represent sample simulated benchmark data for institutions participating in Hack Fest 2026. Real-world organizational audits require verified utility API feeds.
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Sustainability Rankings</h3>
            <p className="text-xs text-slate-500">Sorted by Composite Sustainability Score</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
            Normalized per Capita
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Rank</th>
                <th className="py-3.5 px-6">Entity</th>
                <th className="py-3.5 px-6">Type</th>
                <th className="py-3.5 px-6">Per Capita Footprint</th>
                <th className="py-3.5 px-6">Reduction</th>
                <th className="py-3.5 px-6 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredEntries.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-black text-slate-900">
                    {item.rank === 1 ? (
                      <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">1</span>
                    ) : item.rank === 2 ? (
                      <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold">2</span>
                    ) : item.rank === 3 ? (
                      <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-bold">3</span>
                    ) : (
                      <span className="text-slate-400 pl-2">#{item.rank}</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                      <p className="text-[11px] text-slate-400">{item.location} • {item.members.toLocaleString()} members</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold capitalize">
                      {item.type === 'college' ? <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> : <Building2 className="w-3.5 h-3.5 text-blue-600" />}
                      {item.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-800">
                    {item.perCapitaEmissions} kg CO2e / member
                  </td>
                  <td className="py-4 px-6 font-bold text-emerald-700">
                    -{item.reductionPct}%
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="inline-block px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-black text-sm border border-emerald-200">
                      {item.sustainabilityScore} / 100
                    </span>
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
