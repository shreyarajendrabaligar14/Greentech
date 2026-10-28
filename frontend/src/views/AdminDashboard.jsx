import React, { useEffect, useState } from 'react';
import {
  Users, Activity, Leaf, Trophy, ShieldCheck, UserX, UserCheck,
  Trash2, RefreshCw, AlertTriangle, BarChart3, TrendingUp, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../services/api';

function StatCard({ title, value, icon: Icon, color = 'emerald', subtitle }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const base = getApiBaseUrl();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${base}/api/auth/admin/stats`, { headers: authHeaders }),
        fetch(`${base}/api/auth/admin/users`, { headers: authHeaders }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMsg = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleToggleUser = async (userId, currentStatus) => {
    try {
      const res = await fetch(`${base}/api/auth/admin/users/${userId}/toggle`, {
        method: 'POST',
        headers: authHeaders,
      });
      if (res.ok) {
        showMsg(`User ${currentStatus ? 'deactivated' : 'activated'} successfully.`);
        fetchData();
      }
    } catch (err) {
      showMsg('Action failed. Please try again.');
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Permanently delete user "${email}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${base}/api/auth/admin/users/${userId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (res.ok) {
        showMsg('User deleted successfully.');
        fetchData();
      }
    } catch (err) {
      showMsg('Delete failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-semibold">Loading admin data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#3730a3] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-indigo-200 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrator Control Panel
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Platform Admin Dashboard</h2>
            <p className="text-indigo-300/70 text-sm">Manage users, view platform-wide emissions, and monitor activity.</p>
          </div>
          <button
            onClick={fetchData}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all border border-white/20"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Action Feedback */}
      {actionMsg && (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          {actionMsg}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Users" value={stats?.total_users ?? '—'} icon={Users} color="blue" subtitle="Registered accounts" />
        <StatCard title="Total Activities" value={stats?.total_activities ?? '—'} icon={Activity} color="emerald" subtitle="Emission records logged" />
        <StatCard title="Platform Emissions" value={stats ? `${(stats.total_emissions_kg / 1000).toFixed(1)} t` : '—'} icon={Globe} color="amber" subtitle="Total CO₂e tracked (tonnes)" />
        <StatCard title="Completed Challenges" value={stats?.completed_challenges ?? '—'} icon={Trophy} color="rose" subtitle="Eco-challenges finished" />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">User Management</h3>
            <p className="text-xs text-slate-500 mt-0.5">{users.length} registered accounts</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-700 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Only
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-5 text-left">User</th>
                <th className="py-3 px-5 text-left">Email</th>
                <th className="py-3 px-5 text-left">Role</th>
                <th className="py-3 px-5 text-left">Status</th>
                <th className="py-3 px-5 text-left">Joined</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                        u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {u.full_name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="font-semibold text-slate-800">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 font-medium">{u.email}</td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      u.role === 'admin'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {u.role === 'admin' ? '🛡 Admin' : '👤 User'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      u.is_active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {u.is_active ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-400 text-xs">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center justify-end gap-2">
                      {u.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => handleToggleUser(u.id, u.is_active)}
                            title={u.is_active ? 'Deactivate' : 'Activate'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.is_active
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            title="Delete user"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {u.role === 'admin' && (
                        <span className="text-xs text-slate-300 italic px-2">Protected</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security notice */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-700">
          <strong>Admin Notice:</strong> All user management actions are permanent and logged.
          Exercise caution when deactivating or deleting accounts. Admin accounts cannot be self-modified.
        </div>
      </div>
    </div>
  );
}
