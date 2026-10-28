import React, { useState, useEffect } from 'react';
import { Leaf, Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ onSuccess }) {
  const { login, register, authLoading, authError, setAuthError } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', fullName: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setLocalError('');
    setAuthError(null);
    setSuccessMsg('');
  }, [mode, setAuthError]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setLocalError('');
    setAuthError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (mode === 'register') {
      if (!form.fullName.trim()) return setLocalError('Full name is required.');
      if (form.password.length < 6) return setLocalError('Password must be at least 6 characters.');
      if (form.password !== form.confirmPassword) return setLocalError('Passwords do not match.');
      const result = await register(form.email.trim(), form.fullName.trim(), form.password);
      if (result.success) {
        setSuccessMsg(`Welcome, ${result.user.full_name}! Redirecting...`);
        setTimeout(() => onSuccess(result.user), 800);
      }
    } else {
      const result = await login(form.email.trim(), form.password);
      if (result.success) {
        setSuccessMsg(`Welcome back, ${result.user.full_name}! Redirecting...`);
        setTimeout(() => onSuccess(result.user), 800);
      }
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setForm(f => ({ ...f, email: 'admin@carbontrack.ai', password: 'Admin@2026' }));
    } else {
      setForm(f => ({ ...f, email: 'user@carbontrack.ai', password: 'User@2026' }));
    }
    setMode('login');
  };

  const errorMsg = localError || authError;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#071c10] via-[#0a2a15] to-[#0f3d23] relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl -top-24 -left-24 animate-pulse" />
        <div className="absolute w-80 h-80 rounded-full bg-green-400/10 blur-3xl top-1/2 right-0 animate-pulse delay-700" />
        <div className="absolute w-64 h-64 rounded-full bg-teal-500/10 blur-3xl bottom-0 left-1/3 animate-pulse delay-1000" />
      </div>

      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight">CarbonTrack</span>
            <span className="text-xl font-black text-emerald-400"> AI</span>
          </div>
        </div>

        {/* Hero copy */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Hack Fest 2026 — Green Tech & Sustainability
          </div>
          <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
            Measure Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Carbon Impact.
            </span>
            <br />Take Action.
          </h1>
          <p className="text-lg text-emerald-200/70 max-w-md leading-relaxed">
            Track emissions from electricity, transportation, fuel, and waste.
            Get AI-powered insights and join thousands making a real difference.
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { val: '6+', label: 'Eco Challenges' },
              { val: '8', label: 'Emission Categories' },
              { val: '100%', label: 'Data-Backed' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-emerald-400">{s.val}</p>
                <p className="text-xs text-emerald-200/60 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-emerald-700 text-sm">© 2026 CarbonTrack AI · HackFest Green Tech Track</p>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-14 relative z-10">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Mode tabs */}
            <div className="flex bg-white/5 rounded-2xl p-1 mb-8 gap-1">
              {['login', 'register'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    mode === m
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'text-emerald-300/60 hover:text-emerald-300'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <h2 className="text-2xl font-black text-white mb-1">
              {mode === 'login' ? 'Welcome back 👋' : 'Join the movement 🌱'}
            </h2>
            <p className="text-sm text-emerald-300/50 mb-7">
              {mode === 'login'
                ? 'Sign in to access your carbon dashboard'
                : 'Create your free account and start tracking today'}
            </p>

            {/* Success message */}
            {successMsg && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                {successMsg}
              </div>
            )}

            {/* Error message */}
            {errorMsg && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-300 text-sm font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (register only) */}
              {mode === 'register' && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/60" />
                  <input
                    name="fullName"
                    type="text"
                    placeholder="Full Name"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-emerald-300/30 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  />
                </div>
              )}

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/60" />
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-emerald-300/30 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/60" />
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-emerald-300/30 rounded-xl py-3.5 pl-11 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400/50 hover:text-emerald-400 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Confirm Password (register only) */}
              {mode === 'register' && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/60" />
                  <input
                    name="confirmPassword"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-emerald-300/30 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  />
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:brightness-110 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {authLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-7 pt-6 border-t border-white/10">
              <p className="text-xs text-center text-emerald-300/40 mb-3 uppercase tracking-wider font-semibold">Quick Demo Access</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('user')}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border border-emerald-500/20 text-emerald-300/70 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  Demo User
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border border-amber-500/20 text-amber-300/70 hover:bg-amber-500/10 hover:text-amber-300 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Demo Admin
                </button>
              </div>
            </div>
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mt-6">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <span className="text-white font-bold">CarbonTrack AI</span>
            <span className="text-xs text-emerald-500 font-semibold px-2 py-0.5 bg-emerald-500/10 rounded-full">Hack Fest 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
