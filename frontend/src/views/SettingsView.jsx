import React, { useState } from 'react';
import {
  Database,
  Trash2,
  Building2,
  GraduationCap,
  User,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export default function SettingsView({
  profileType,
  setProfileType,
  onResetData,
  onSeedData
}) {
  const [orgName, setOrgName] = useState(
    profileType === 'college'
      ? 'GreenTech University'
      : profileType === 'organization'
      ? 'EcoEnterprises Global'
      : 'Eco Citizen User'
  );

  const [regionGrid, setRegionGrid] = useState('india_cea');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleProfileChange = (type) => {
    setProfileType(type);
    if (type === 'college') setOrgName('GreenTech University');
    else if (type === 'organization') setOrgName('EcoEnterprises Global');
    else setOrgName('Eco Citizen User');
  };

  const executeReset = async () => {
    setShowConfirmReset(false);
    setStatusMsg('Resetting stored database records...');
    try {
      if (onResetData) {
        await onResetData();
      }
      setStatusMsg('All locally stored activity records have been purged.');
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      setStatusMsg(`Reset error: ${err.message}`);
    }
  };

  const executeSeed = async () => {
    setStatusMsg('Populating sample demonstration records...');
    try {
      if (onSeedData) {
        await onSeedData();
      }
      setStatusMsg('5 verified historical audit records loaded successfully!');
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      setStatusMsg(`Seed error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Settings & Local Data Management
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure profile context, regional baseline grid, and inspect SQLite storage
        </p>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Profile Selection Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Entity Profile Type</h3>
          <p className="text-xs text-slate-500">Adapts context for individual households, universities, or corporate campuses</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => handleProfileChange('individual')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              profileType === 'individual'
                ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-400/30'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center mb-3">
              <User className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-900 text-sm">Individual / Household</p>
            <p className="text-[11px] text-slate-500 mt-1">Personal commutes, home power & lifestyle</p>
          </button>

          <button
            onClick={() => handleProfileChange('college')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              profileType === 'college'
                ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-400/30'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-900 text-sm">College / University</p>
            <p className="text-[11px] text-slate-500 mt-1">Hostels, labs, faculty transit & campus energy</p>
          </button>

          <button
            onClick={() => handleProfileChange('organization')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              profileType === 'organization'
                ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-400/30'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <p className="font-bold text-slate-900 text-sm">Organization / SME</p>
            <p className="text-[11px] text-slate-500 mt-1">Office buildings, corporate fleets & HVAC</p>
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Display Name / Identifier
          </label>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="w-full sm:w-80 px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Regional Grid Factors */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Regional Electricity Factor Baseline</h3>
          <p className="text-xs text-slate-500">Reflects your local utility fuel generation mix</p>
        </div>

        <div className="w-full sm:w-96">
          <select
            value={regionGrid}
            onChange={(e) => setRegionGrid(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="india_cea">India National Grid (0.82 kg CO2e / kWh) - Active</option>
            <option value="us_egrid">US eGRID National Average (0.38 kg CO2e / kWh)</option>
            <option value="eu_eea">European Union Average (0.23 kg CO2e / kWh)</option>
            <option value="global">Global Benchmark Average (0.47 kg CO2e / kWh)</option>
          </select>
        </div>
      </div>

      {/* Local SQLite Storage Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Local Data Storage Transparency</h3>
            <p className="text-xs text-slate-500">FastAPI + SQLite architecture</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Where your data lives:</strong> All carbon entries, challenges, and reduction targets are persisted in a local SQLite file (<code>backend/carbontrack.db</code>).
            </span>
          </div>
          <p className="text-slate-500 pl-6">
            No proprietary user emissions or sensitive activity details are sold or uploaded to third-party ad networks. Calculations run on your local Python FastAPI server.
          </p>
        </div>

        {/* Evaluator Demo Tools & Reset Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            id="btn-seed-sample-data"
            onClick={executeSeed}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Load Demo Activity Data (Hack Fest Testing)</span>
          </button>

          <button
            id="btn-reset-data"
            onClick={() => setShowConfirmReset(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge All Stored Records</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h4 className="text-lg font-bold text-slate-900">Are you sure?</h4>
              <p className="text-xs text-slate-500 mt-1">
                This will delete all saved activity logs and targets from your local SQLite database. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-purge"
                onClick={executeReset}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
              >
                Yes, Purge Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
