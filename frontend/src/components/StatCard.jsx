import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export default function StatCard({
  title,
  value,
  unit = '',
  icon: Icon,
  trend = null, // e.g. -12.5 (negative is good for carbon!)
  trendLabel = 'vs last period',
  subtitle = null,
  color = 'emerald', // 'emerald', 'amber', 'blue', 'purple'
  isLoading = false
}) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
      pill: 'bg-emerald-100 text-emerald-800',
      accent: 'border-l-emerald-500',
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-600 border-amber-200/50',
      pill: 'bg-amber-100 text-amber-800',
      accent: 'border-l-amber-500',
    },
    blue: {
      bg: 'bg-blue-500/10 text-blue-600 border-blue-200/50',
      pill: 'bg-blue-100 text-blue-800',
      accent: 'border-l-blue-500',
    },
    rose: {
      bg: 'bg-rose-500/10 text-rose-600 border-rose-200/50',
      pill: 'bg-rose-100 text-rose-800',
      accent: 'border-l-rose-500',
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  // In emissions, a decrease (negative) is good (green), an increase is bad (rose)
  const isGood = trend !== null && trend < 0;
  const isNeutral = trend === null || trend === 0;

  return (
    <div className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            {isLoading ? (
              <div className="h-8 w-28 bg-slate-200 rounded animate-pulse"></div>
            ) : (
              <>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {value}
                </span>
                {unit && (
                  <span className="text-xs sm:text-sm font-semibold text-slate-500">
                    {unit}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${scheme.bg} group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {trend !== null && !isLoading ? (
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                isGood
                  ? 'bg-emerald-100 text-emerald-800'
                  : isNeutral
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isGood ? (
                <ArrowDownRight className="w-3.5 h-3.5" />
              ) : isNeutral ? (
                <Minus className="w-3 h-3" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5" />
              )}
              {Math.abs(trend)}%
            </span>
            <span className="text-slate-400 font-medium">{trendLabel}</span>
          </div>
        ) : (
          <span className="text-slate-400 font-medium">{subtitle || 'Standardized metric'}</span>
        )}
      </div>
    </div>
  );
}
