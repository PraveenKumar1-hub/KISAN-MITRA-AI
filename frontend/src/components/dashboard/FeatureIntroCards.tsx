import { CloudSun, Sprout, Activity, TrendingUp, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureCardConfig {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  badge: string;
  description: string;
  link: string;
}

const featureCards: FeatureCardConfig[] = [
  {
    title: 'Weather Intelligence',
    icon: CloudSun,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    badge: 'Weather Service',
    description: 'Weather service is not connected yet.',
    link: '/weather',
  },
  {
    title: 'Plant Health',
    icon: Activity,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50',
    badge: 'Vision AI',
    description: 'Plant health analysis will appear here after an image is uploaded.',
    link: '/plant-health',
  },
  {
    title: 'Crop Advisory',
    icon: Sprout,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    badge: 'AI Advisory',
    description: 'AI crop recommendations will appear here after farm analysis is enabled.',
    link: '/crop-advisory',
  },
  {
    title: 'Market Prices',
    icon: TrendingUp,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    badge: 'Market Network',
    description: 'Live mandi prices will appear here after market data integration.',
    link: '/market-prices',
  },
];

export default function FeatureIntroCards() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">
          Current Agricultural Insights
        </h3>
        <span className="text-xs text-slate-500 font-medium">Integration Status</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featureCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-lg ${card.iconBg} ${card.iconColor} flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{card.title}</h4>
                </div>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {card.badge}
                </span>
              </div>

              {/* Feature Introduction State Container */}
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/70 p-4 text-center flex flex-col items-center justify-center min-h-[96px]">
                <Info className="w-4 h-4 text-slate-400 mb-1.5" />
                <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
                  {card.description}
                </p>
                <Link
                  to={card.link}
                  className="mt-2 text-[11px] font-semibold text-primary-600 hover:text-primary-700 hover:underline inline-block"
                >
                  View Module Roadmap &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
