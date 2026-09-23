import { useAuth } from '../../context/AuthContext';

export default function WelcomeBanner() {
  const { user } = useAuth();
  const farmerName = user?.full_name || 'Farmer';

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {farmerName}
          </h2>
          <p className="mt-1 text-sm sm:text-base text-slate-600">
            Here is an overview of your farm and current agricultural information.
          </p>
        </div>
      </div>
    </section>
  );
}
