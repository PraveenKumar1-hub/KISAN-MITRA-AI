import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import FarmOverviewCard from '../components/dashboard/FarmOverviewCard';
import QuickActions from '../components/dashboard/QuickActions';
import FarmIntelligence from '../components/dashboard/FarmIntelligence';
import RecentActivity from '../components/dashboard/RecentActivity';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!user) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-8 text-center max-w-lg mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Unable to load farm profile</h3>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          The server could not retrieve your registered account details. Please check your backend connection or sign in again.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Welcome Section */}
      <WelcomeBanner />

      {/* 2. Farm Overview Card (Real backend user details) */}
      <FarmOverviewCard />

      {/* 3. Quick Actions */}
      <QuickActions />

      {/* 4. AI Insights - Farm Intelligence Layer */}
      <FarmIntelligence />

      {/* 5. Recent Activity (Clean empty-state) */}
      <RecentActivity />
    </div>
  );
}
