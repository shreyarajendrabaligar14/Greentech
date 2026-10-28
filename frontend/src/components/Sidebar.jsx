import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calculator,
  BarChart3,
  Sparkles,
  Target,
  Award,
  Users,
  Settings,
  Leaf,
  ChevronRight,
  ShieldCheck,
  Building2,
  GraduationCap,
  User,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';


const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { path: '/calculator', label: 'Footprint Calculator', icon: Calculator, badge: 'Active' },
  { path: '/analytics', label: 'Emission Analytics', icon: BarChart3, badge: null },
  { path: '/recommendations', label: 'Reduction AI', icon: Sparkles, badge: 'Rule-Based' },
  { path: '/progress', label: 'Progress & Targets', icon: Target, badge: null },
  { path: '/challenges', label: 'Green Challenges', icon: Award, badge: 'Gamified' },
  { path: '/leaderboard', label: 'Leaderboard', icon: Users, badge: 'Demo' },
  { path: '/settings', label: 'Settings & Data', icon: Settings, badge: null },
];

export default function Sidebar({ profileType = 'individual', isBackendConnected = false, isAdmin = false }) {
  const location = useLocation();
  const { user } = useAuth();


  const getProfileIcon = () => {
    if (profileType === 'college') return <GraduationCap className="w-4 h-4 text-emerald-400" />;
    if (profileType === 'organization') return <Building2 className="w-4 h-4 text-emerald-400" />;
    return <User className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <aside className="w-72 bg-gradient-to-b from-[#092314] via-[#0c2e1b] to-[#081f12] text-white flex flex-col h-screen sticky top-0 border-r border-emerald-900/30 select-none z-30 shadow-2xl shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-emerald-800/40">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-300/30 group-hover:scale-105 transition-transform">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white">CarbonTrack</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">AI</span>
            </div>
            <p className="text-[11px] font-medium text-emerald-300/70 tracking-wide uppercase">Hack Fest 2026</p>
          </div>
        </Link>
        <div className="mt-4 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getProfileIcon()}
            <span className="text-xs font-semibold text-emerald-200 capitalize">{profileType} Edition</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">Verified</span>
        </div>
      </div>

      {/* Navigation List via React Router Link */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[11px] font-semibold text-emerald-400/60 uppercase tracking-wider mb-2">Main Menu</p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/' 
            ? (location.pathname === '/' || location.pathname === '/dashboard')
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              id={`nav-${item.path.replace('/', '') || 'dashboard'}`}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-900/40 font-semibold ring-1 ring-emerald-400/30'
                  : 'text-emerald-100/75 hover:bg-emerald-900/30 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-emerald-400/80'}`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-emerald-900/60 text-emerald-300/80 border border-emerald-800/40'
                  }`}>
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'opacity-100 translate-x-0.5 text-white' : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-emerald-400/50'}`} />
              </div>
            </Link>
          );
        })}

        {/* Admin-only link */}
        {isAdmin && (
          <>
            <p className="px-3 text-[11px] font-semibold text-amber-400/60 uppercase tracking-wider mt-4 mb-2">Administration</p>
            <Link
              to="/admin"
              id="nav-admin"
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                location.pathname === '/admin'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/40 font-semibold'
                  : 'text-amber-200/75 hover:bg-indigo-900/30 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className={`w-5 h-5 ${location.pathname === '/admin' ? 'text-white' : 'text-amber-400/80'}`} />
                <span>Admin Panel</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/20">Admin</span>
            </Link>
          </>
        )}
      </nav>

      {/* Footer / System Status */}
      <div className="p-4 border-t border-emerald-800/40 bg-[#07190e]/70">
        {/* Logged-in user */}
        {user && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-2 rounded-lg bg-emerald-950/80 border border-emerald-800/40">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
              user.role === 'admin' ? 'bg-indigo-400/20 text-indigo-300' : 'bg-emerald-400/20 text-emerald-300'
            }`}>
              {user.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
              <p className="text-[10px] text-emerald-400/60 truncate capitalize">{user.role === 'admin' ? '🛡 Administrator' : '👤 ' + user.email}</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between text-xs px-2 py-2 rounded-lg bg-emerald-950/80 border border-emerald-800/40">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-emerald-200/90 font-medium text-[11px]">
              {isBackendConnected ? 'FastAPI & SQLite Sync' : 'LocalStorage Active'}
            </span>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-400/70" />
        </div>
        <p className="text-[10px] text-emerald-400/50 text-center mt-2">
          Green Tech & Sustainability • 2026
        </p>
      </div>
    </aside>
  );
}
