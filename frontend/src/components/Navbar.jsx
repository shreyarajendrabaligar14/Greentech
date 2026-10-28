import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  PlusCircle,
  HelpCircle,
  Building2,
  GraduationCap,
  User,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';


export default function Navbar({
  profileType,
  setProfileType,
  onOpenFactors,
  isBackendConnected,
  onLogout
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();


  const titles = {
    '/': { title: 'Sustainability Overview', subtitle: 'Real-time carbon footprint metrics & reduction score' },
    '/dashboard': { title: 'Sustainability Overview', subtitle: 'Real-time carbon footprint metrics & reduction score' },
    '/calculator': { title: 'Carbon Footprint Calculator', subtitle: 'Enter activity across electricity, travel, fuel, and waste with verified formulas' },
    '/analytics': { title: 'Emission Analytics', subtitle: 'Interactive breakdowns, category trends & CSV reports' },
    '/recommendations': { title: 'Personalized Reduction Engine', subtitle: 'Transparent, rule-based recommendations for high-impact actions' },
    '/progress': { title: 'Progress & Reduction Targets', subtitle: 'Set climate targets and track month-over-month reductions' },
    '/challenges': { title: 'Sustainability Challenges', subtitle: 'Actionable green habits and eco-badges' },
    '/leaderboard': { title: 'Community Leaderboard', subtitle: 'Normalized benchmarking for colleges & organizations (Demo data)' },
    '/settings': { title: 'Settings & Data Management', subtitle: 'Manage organization profile, emission factors, and local database' },
  };

  const currentMeta = titles[location.pathname] || titles['/'];

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 py-4 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {currentMeta.title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Green Tech 2026
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {currentMeta.subtitle}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Emission Factor Info Button */}
          <button
            id="btn-view-factors"
            onClick={onOpenFactors}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition-colors"
            title="View verified emission factors and formulas"
          >
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span className="hidden lg:inline">Emission Factors</span>
          </button>

          {/* Profile Switcher Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="profile-btn-individual"
              onClick={() => setProfileType('individual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                profileType === 'individual'
                  ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Individual</span>
            </button>
            <button
              id="profile-btn-college"
              onClick={() => setProfileType('college')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                profileType === 'college'
                  ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>College</span>
            </button>
            <button
              id="profile-btn-org"
              onClick={() => setProfileType('organization')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                profileType === 'organization'
                  ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Org</span>
            </button>
          </div>

          {/* Quick Log Action */}
          {location.pathname !== '/calculator' && (
            <button
              id="btn-quick-log"
              onClick={() => navigate('/calculator')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Emissions</span>
            </button>
          )}

          {/* Backend Status indicator */}
          <div
            className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border ${
              isBackendConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
            title={isBackendConnected ? 'FastAPI backend connected (port 8081)' : 'LocalStorage mode active'}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isBackendConnected ? 'Backend Sync Online' : 'LocalStorage Mode'}</span>
          </div>

          {/* User avatar + logout */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {user.full_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">{user.full_name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
              </div>
              <button
                onClick={onLogout}
                title="Sign out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
