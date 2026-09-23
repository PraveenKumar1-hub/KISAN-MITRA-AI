import {
  User,
  MapPin,
  Maximize2,
  Layers,
  Droplets,
  Sprout
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function FarmOverviewCard() {
  const { user } = useAuth();

  const getFarmSizeText = (size?: string | null) => {
    if (!size || !size.trim()) return 'Not provided';
    return size.toLowerCase().includes('acre') ? size : `${size} Acres`;
  };

  const farmDetails = [
    {
      label: 'Farmer Name',
      value: user?.full_name?.trim() || 'Not provided',
      icon: User,
      iconColor: 'text-primary-600',
      iconBg: 'bg-primary-50',
    },
    {
      label: 'Location',
      value: user?.location?.trim() || 'Not provided',
      icon: MapPin,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      label: 'Farm Size',
      value: getFarmSizeText(user?.farm_size),
      icon: Maximize2,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50',
    },
    {
      label: 'Soil Type',
      value: user?.soil_type?.trim() || 'Not provided',
      icon: Layers,
      iconColor: 'text-amber-700',
      iconBg: 'bg-amber-50',
    },
    {
      label: 'Irrigation Type',
      value: user?.irrigation_type?.trim() || 'Not provided',
      icon: Droplets,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      label: 'Primary Crop',
      value: user?.primary_crop?.trim() || 'Not provided',
      icon: Sprout,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Farm Overview</h3>
          <p className="text-xs text-slate-500">
            Registered farm profile and agricultural parameters
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200">
          Verified Profile
        </span>
      </div>

      {/* Grid of 6 actual registered fields */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {farmDetails.map((item) => {
          const Icon = item.icon;
          const isNotProvided = item.value === 'Not provided';

          return (
            <div
              key={item.label}
              className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start space-x-3"
            >
              <div
                className={`p-2 rounded-lg ${item.iconBg} ${item.iconColor} flex-shrink-0 mt-0.5`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-slate-500 leading-tight">
                  {item.label}
                </span>
                <span
                  className={`block text-sm font-semibold mt-1 truncate ${
                    isNotProvided ? 'text-slate-400 italic font-normal' : 'text-slate-900'
                  }`}
                  title={item.value}
                >
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
