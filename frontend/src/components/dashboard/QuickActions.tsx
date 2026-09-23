import { Link } from 'react-router-dom';
import { Sprout, Activity, CloudSun, Droplets, TrendingUp, Bot, ArrowUpRight } from 'lucide-react';

interface QuickActionItem {
  title: string;
  subtitle: string;
  to: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  badge: string;
  badgeClass: string;
}

const actions: QuickActionItem[] = [
  {
    title: 'Crop Recommendation',
    subtitle: 'Soil & climate advisory',
    to: '/crop-advisory',
    icon: Sprout,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    badge: 'Active',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    title: 'Plant Health',
    subtitle: 'Disease detection vision',
    to: '/plant-health',
    icon: Activity,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    badge: 'Active',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    title: 'Weather',
    subtitle: 'Forecast & alerts',
    to: '/weather',
    icon: CloudSun,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    badge: 'Active',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    title: 'Smart Irrigation',
    subtitle: 'Rule-based scheduling',
    to: '/irrigation',
    icon: Droplets,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    badge: 'Active',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    title: 'Market Prices',
    subtitle: 'Live mandi rates',
    to: '/market-prices',
    icon: TrendingUp,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    badge: 'Active',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    title: 'AI Assistant',
    subtitle: 'Farmer support chat',
    to: '/ai-assistant',
    icon: Bot,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    badge: 'Active',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
];

export default function QuickActions() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
        <span className="text-xs text-slate-500 font-medium">Platform Modules</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.to}
              className="group relative bg-white border border-slate-200 hover:border-primary-300 rounded-xl p-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 rounded-lg ${action.iconBg} ${action.iconColor} flex items-center justify-center transition-transform group-hover:scale-105`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center space-x-1">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${action.badgeClass}`}
                  >
                    {action.badge}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-600 transition-colors" />
                </div>
              </div>

              <div className="mt-3">
                <h4 className="text-sm font-semibold text-slate-800 group-hover:text-primary-700 transition-colors leading-tight">
                  {action.title}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  {action.subtitle}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
