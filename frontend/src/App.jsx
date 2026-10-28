import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import FactorInfoModal from './components/FactorInfoModal';
import EcoBot from './components/EcoBot';
import { useAuth } from './context/AuthContext';

// Views
import AuthPage from './views/AuthPage';
import DashboardView from './views/DashboardView';
import CalculatorView from './views/CalculatorView';
import AnalyticsView from './views/AnalyticsView';
import RecommendationsView from './views/RecommendationsView';
import ProgressView from './views/ProgressView';
import ChallengesView from './views/ChallengesView';
import LeaderboardView from './views/LeaderboardView';
import SettingsView from './views/SettingsView';
import AdminDashboard from './views/AdminDashboard';

// API
import { api } from './services/api';

const STORAGE_KEYS = {
  ACTIVITIES: 'carbontrack_activities',
  CHALLENGES: 'carbontrack_challenges',
  TARGETS: 'carbontrack_targets',
  PROFILE: 'carbontrack_profile',
};

const INITIAL_CHALLENGES = [
  {
    id: 1,
    title: 'Public Transit Week',
    description: 'Use metro, city bus, or shared campus transit for all weekday trips instead of driving alone.',
    category: 'Transportation',
    duration: '5 Days',
    impact: '~18.5 kg CO2e saved',
    points: 80,
    completed: false
  },
  {
    id: 2,
    title: 'Zero Vampire Power Audit',
    description: 'Inspect dorm, lab, or apartment to unplug idle computer chargers, monitors, and microwave ovens.',
    category: 'Electricity',
    duration: 'Single Audit',
    impact: '~6.2 kg CO2e / month saved',
    points: 40,
    completed: false
  },
  {
    id: 3,
    title: 'Organic Waste Segregation & Compost',
    description: 'Divert all food scraps, fruit peels, and coffee grounds from landfill into composting bins.',
    category: 'Waste',
    duration: '7 Days',
    impact: '~4.5 kg CO2e prevented',
    points: 60,
    completed: false
  },
  {
    id: 4,
    title: 'Plant-Rich Green Monday',
    description: 'Adopt 100% plant-based nutritious meals for a full day to reduce agricultural footprint.',
    category: 'Diet',
    duration: '1 Day',
    impact: '~3.8 kg CO2e saved',
    points: 50,
    completed: false
  },
  {
    id: 5,
    title: 'Thermostat 24°C Standard',
    description: 'Keep room AC or heat pump set at or above 24°C (75°F) throughout active cooling hours.',
    category: 'Electricity',
    duration: '2 Weeks',
    impact: '~14.0 kg CO2e saved',
    points: 75,
    completed: false
  },
  {
    id: 6,
    title: 'Zero Single-Use Plastic Week',
    description: 'Carry a reusable water bottle, cloth bag, and stainless steel cutlery for all meals.',
    category: 'Waste',
    duration: '7 Days',
    impact: '~2.1 kg CO2e lifecycle saved',
    points: 45,
    completed: false
  }
];

// ── Protected main app (shown after login) ──────────────────────────────────
function MainApp({ onLogout }) {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [profileType, setProfileType] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.PROFILE) || 'individual'
  );
  const [activities, setActivities] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [targets, setTargets] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TARGETS);
      return saved ? JSON.parse(saved) : { reduction_percentage: 20, target_year: '2026', baseline_emissions: 0 };
    } catch { return { reduction_percentage: 20, target_year: '2026', baseline_emissions: 0 }; }
  });
  const [challenges, setChallenges] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
      return saved ? JSON.parse(saved) : INITIAL_CHALLENGES;
    } catch { return INITIAL_CHALLENGES; }
  });
  const [summary, setSummary] = useState(null);
  const [isFactorModalOpen, setIsFactorModalOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, profileType);
  }, [profileType]);

  const computeLocalSummary = (acts) => {
    if (!acts || acts.length === 0) return null;
    let elec = 0, trans = 0, fuel = 0, waste = 0;
    acts.forEach(a => {
      elec += Number(a.electricity_emissions || 0);
      trans += Number(a.transportation_emissions || 0);
      fuel += Number(a.fuel_emissions || 0);
      waste += Number(a.waste_emissions || 0);
    });
    const latest = acts[0];
    let changePct = null;
    if (acts.length >= 2 && acts[1].total_emissions > 0) {
      changePct = Math.round(((latest.total_emissions - acts[1].total_emissions) / acts[1].total_emissions) * 1000) / 10;
    }
    const monthMap = {};
    [...acts].reverse().forEach(a => {
      const d = a.date || '2026-10';
      const m = d.substring(0, 7);
      monthMap[m] = (monthMap[m] || 0) + Number(a.total_emissions || 0);
    });
    const monthly_trends = Object.entries(monthMap).map(([m, val]) => ({
      month: m,
      emissions: Math.round(val * 10) / 10
    }));
    return {
      total_emissions: latest.total_emissions,
      electricity_emissions: latest.electricity_emissions,
      transportation_emissions: latest.transportation_emissions,
      fuel_emissions: latest.fuel_emissions,
      waste_emissions: latest.waste_emissions,
      activity_count: acts.length,
      change_pct: changePct,
      monthly_trends
    };
  };

  const refreshData = async () => {
    try {
      await api.checkHealth();
      setIsBackendConnected(true);
      const [sumRes, actRes, targetRes, chRes] = await Promise.all([
        api.getDashboardSummary().catch(() => null),
        api.getActivities().catch(() => null),
        api.getTargets().catch(() => null),
        api.getChallenges().catch(() => null),
      ]);
      if (actRes && Array.isArray(actRes)) {
        if (actRes.length > 0) {
          setActivities(actRes);
          localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(actRes));
        } else if (activities.length > 0) {
          for (const item of activities) {
            await api.createActivity(item).catch(() => {});
          }
          const syncedActs = await api.getActivities().catch(() => activities);
          setActivities(syncedActs);
        }
      }
      if (sumRes) setSummary(sumRes);
      if (targetRes) {
        setTargets(targetRes);
        localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(targetRes));
      }
      if (chRes && Array.isArray(chRes)) {
        setChallenges(chRes);
        localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(chRes));
      }
    } catch {
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 6000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeSummary = summary || computeLocalSummary(activities);

  const handleSaveActivity = async (record) => {
    const localId = Date.now();
    const newRecord = { id: localId, ...record };
    const updated = [newRecord, ...activities];
    setActivities(updated);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
    setSummary(computeLocalSummary(updated));
    if (isBackendConnected) {
      try {
        await api.createActivity(record);
        await refreshData();
      } catch (err) {
        console.warn('Backend save failed; stored safely in localStorage:', err);
      }
    }
  };

  const handleDeleteActivity = async (id) => {
    const updated = activities.filter(a => a.id !== id);
    setActivities(updated);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
    setSummary(computeLocalSummary(updated));
    if (isBackendConnected) {
      try {
        await api.deleteActivity(id);
        await refreshData();
      } catch (err) {
        console.warn('Backend delete failed, removed from localStorage:', err);
      }
    }
  };

  const handleSaveTarget = async (targetData) => {
    setTargets(targetData);
    localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(targetData));
    if (isBackendConnected) {
      try {
        await api.saveTarget(targetData);
      } catch (err) {
        console.warn('Backend target save failed:', err);
      }
    }
  };

  const handleToggleChallenge = async (id, completed) => {
    const updated = challenges.map(c => c.id === id ? { ...c, completed } : c);
    setChallenges(updated);
    localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(updated));
    if (isBackendConnected) {
      try {
        await api.toggleChallenge(id, completed);
      } catch (err) {
        console.warn('Backend challenge toggle failed:', err);
      }
    }
  };

  const handleResetData = async () => {
    setActivities([]);
    setSummary(null);
    setChallenges(INITIAL_CHALLENGES);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.CHALLENGES);
    localStorage.removeItem(STORAGE_KEYS.TARGETS);
    if (isBackendConnected) {
      try {
        await api.resetData();
      } catch (err) {
        console.warn('Backend reset failed:', err);
      }
    }
  };

  const handleSeedData = async () => {
    const sampleSeeds = [
      {
        title: 'October 2026 Campus & Living Audit',
        date: '2026-10-15',
        total_emissions: 284.5,
        electricity_emissions: 164.0,
        transportation_emissions: 51.0,
        fuel_emissions: 46.2,
        waste_emissions: 23.3,
        details: { electricity: { kwh: 200 }, transportation: { km: 300, mode: 'car_petrol' } }
      },
      {
        title: 'September 2026 Energy & Commute Review',
        date: '2026-09-18',
        total_emissions: 312.0,
        electricity_emissions: 180.4,
        transportation_emissions: 68.0,
        fuel_emissions: 42.0,
        waste_emissions: 21.6,
        details: { electricity: { kwh: 220 }, transportation: { km: 400, mode: 'car_petrol' } }
      },
      {
        title: 'August 2026 Baseline Assessment',
        date: '2026-08-20',
        total_emissions: 345.2,
        electricity_emissions: 196.8,
        transportation_emissions: 76.5,
        fuel_emissions: 48.5,
        waste_emissions: 23.4,
        details: { electricity: { kwh: 240 }, transportation: { km: 450, mode: 'car_petrol' } }
      }
    ];
    for (const record of sampleSeeds) {
      await handleSaveActivity(record);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col md:flex-row text-slate-800">
      <Sidebar profileType={profileType} isBackendConnected={isBackendConnected} isAdmin={isAdmin} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          profileType={profileType}
          setProfileType={setProfileType}
          onOpenFactors={() => setIsFactorModalOpen(true)}
          isBackendConnected={isBackendConnected}
          onLogout={onLogout}
        />
        <main className="flex-1 p-5 sm:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardView
                  summary={activeSummary}
                  activities={activities}
                  targets={targets}
                  challenges={challenges}
                  onNavigate={navigate}
                  onOpenFactors={() => setIsFactorModalOpen(true)}
                  isLoading={isLoading}
                />
              }
            />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route
              path="/calculator"
              element={
                <CalculatorView
                  onSaveActivity={handleSaveActivity}
                  onOpenFactors={() => setIsFactorModalOpen(true)}
                />
              }
            />
            <Route path="/analytics" element={<AnalyticsView activities={activities} />} />
            <Route path="/recommendations" element={<RecommendationsView activities={activities} />} />
            <Route
              path="/progress"
              element={
                <ProgressView
                  activities={activities}
                  targets={targets}
                  onSaveTarget={handleSaveTarget}
                  onDeleteActivity={handleDeleteActivity}
                />
              }
            />
            <Route
              path="/challenges"
              element={
                <ChallengesView
                  challenges={challenges}
                  onToggleChallenge={handleToggleChallenge}
                  isLoading={isLoading}
                />
              }
            />
            <Route path="/leaderboard" element={<LeaderboardView profileType={profileType} />} />
            <Route
              path="/settings"
              element={
                <SettingsView
                  profileType={profileType}
                  setProfileType={setProfileType}
                  onResetData={handleResetData}
                  onSeedData={handleSeedData}
                  isBackendConnected={isBackendConnected}
                />
              }
            />
            {/* Admin-only route */}
            {isAdmin && (
              <Route path="/admin" element={<AdminDashboard />} />
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Verified Emission Factors Modal */}
      <FactorInfoModal
        isOpen={isFactorModalOpen}
        onClose={() => setIsFactorModalOpen(false)}
      />

      {/* EcoBot Floating Chatbot */}
      <EcoBot />
    </div>
  );
}

// ── Root App — handles auth gating ──────────────────────────────────────────
export default function App() {
  const { isAuthenticated, logout } = useAuth();

  const handleAuthSuccess = () => {
    // Navigate handled via isAuthenticated reactive state
  };

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return <AuthPage onSuccess={handleAuthSuccess} />;
  }

  return <MainApp onLogout={handleLogout} />;
}
