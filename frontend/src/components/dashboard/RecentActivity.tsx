import { History } from 'lucide-react';

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
        <span className="text-xs text-slate-400 font-medium">History</span>
      </div>

      {/* Clean Empty State */}
      <div className="p-8 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
          <History className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700">No activity yet</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          No activity yet. Your activities will appear here as you use Kisan Mitra AI.
        </p>
      </div>
    </div>
  );
}
