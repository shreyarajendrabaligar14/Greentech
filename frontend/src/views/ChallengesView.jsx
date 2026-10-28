import React from 'react';
import {
  Award,
  CheckCircle2,
  Circle,
  Sparkles,
  Zap,
  Car,
  Trash2,
  Salad,
  Sun
} from 'lucide-react';

export default function ChallengesView({
  challenges = [],
  onToggleChallenge
}) {
  const completedCount = challenges.filter(c => c.completed).length;
  const totalPoints = challenges.reduce((acc, c) => c.completed ? acc + (c.points || 50) : acc, 0);

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'electricity': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'transportation': return <Car className="w-5 h-5 text-blue-500" />;
      case 'waste': return <Trash2 className="w-5 h-5 text-emerald-500" />;
      case 'diet': return <Salad className="w-5 h-5 text-lime-600" />;
      default: return <Sun className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Challenges Header Banner */}
      <div className="bg-gradient-to-r from-[#092b17] via-[#0c391f] to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Demonstration Challenge Framework</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Green Habit Challenges
            </h2>
            <p className="text-emerald-200/80 text-xs sm:text-sm max-w-xl">
              Turn carbon awareness into concrete daily sustainability habits. Complete challenges to boost your overall sustainability score.
            </p>
          </div>

          {/* Gamification Points Badge */}
          <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/20 flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-300/80 uppercase tracking-wider">Earned Eco-Points</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-white">{totalPoints}</span>
                <span className="text-xs text-emerald-300 font-semibold">pts ({completedCount}/{challenges.length} Done)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demonstration Data Label Notice */}
      <div className="bg-slate-100 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px] uppercase">
            Notice
          </span>
          <span>
            These challenges are predefined demonstration habits tailored for Hack Fest 2026. Interactive toggling saves state to your local SQLite store.
          </span>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => {
          const isDone = challenge.completed;

          return (
            <div
              key={challenge.id}
              className={`rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between group ${
                isDone
                  ? 'bg-emerald-50/80 border-emerald-300 shadow-md ring-1 ring-emerald-400/30'
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {getCategoryIcon(challenge.category)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      +{challenge.points || 50} pts
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                      {challenge.duration || 'Weekly'}
                    </span>
                  </div>
                </div>

                <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                  {challenge.title}
                </h4>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {challenge.description}
                </p>

                <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-700">Estimated Impact:</span> {challenge.impact}
                </div>
              </div>

              {/* Toggle Completion Button */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  id={`btn-toggle-challenge-${challenge.id}`}
                  onClick={() => onToggleChallenge && onToggleChallenge(challenge.id, !isDone)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    isDone
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white'
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>Completed!</span>
                    </>
                  ) : (
                    <>
                      <Circle className="w-4 h-4 text-slate-400 group-hover:text-white" />
                      <span>Mark as Completed</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
