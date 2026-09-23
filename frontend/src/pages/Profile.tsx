import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  Mail,
  MapPin,
  Maximize2,
  Layers,
  Droplets,
  Sprout,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'KM';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getFarmSizeText = (size?: string | null) => {
    if (!size || !size.trim()) return 'Not provided';
    return size.toLowerCase().includes('acre') ? size : `${size} Acres`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Farmer Profile
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Your registered personal account details and agricultural parameters.
        </p>
      </div>

      {/* Main Profile Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5">
          <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-2xl border-2 border-primary-200 shadow-xs flex-shrink-0">
            {user?.full_name ? getInitials(user.full_name) : <UserIcon className="w-10 h-10" />}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {user?.full_name || 'Farmer'}
                </h3>
                <p className="text-sm text-slate-500">{user?.email || 'No email associated'}</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-center sm:self-start">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Verified Farmer
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                {user?.location || 'Not provided'}
              </span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-slate-400" />
                {user?.created_at
                  ? `Member since ${new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`
                  : 'Registered Kisan Mitra Member'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Account Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">Account Details</h4>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <span className="block text-xs font-medium text-slate-400">Full Name</span>
              <div className="flex items-center space-x-2 mt-1">
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-800">
                  {user?.full_name || 'Not provided'}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-400">Email Address</span>
              <div className="flex items-center space-x-2 mt-1">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-800">
                  {user?.email || 'Not provided'}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-400">Location / District</span>
              <div className="flex items-center space-x-2 mt-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-800">
                  {user?.location || 'Not provided'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Agricultural Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">Agricultural Profile</h4>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <span className="block text-xs font-medium text-slate-400">Farm Size</span>
              <div className="flex items-center space-x-2 mt-1">
                <Maximize2 className="w-4 h-4 text-slate-400" />
                <span
                  className={`text-sm font-medium ${
                    !user?.farm_size ? 'text-slate-400 italic' : 'text-slate-800'
                  }`}
                >
                  {getFarmSizeText(user?.farm_size)}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-400">Soil Type</span>
              <div className="flex items-center space-x-2 mt-1">
                <Layers className="w-4 h-4 text-slate-400" />
                <span
                  className={`text-sm font-medium ${
                    !user?.soil_type ? 'text-slate-400 italic' : 'text-slate-800'
                  }`}
                >
                  {user?.soil_type || 'Not provided'}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-400">Irrigation Type</span>
              <div className="flex items-center space-x-2 mt-1">
                <Droplets className="w-4 h-4 text-slate-400" />
                <span
                  className={`text-sm font-medium ${
                    !user?.irrigation_type ? 'text-slate-400 italic' : 'text-slate-800'
                  }`}
                >
                  {user?.irrigation_type || 'Not provided'}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-400">Primary Crop</span>
              <div className="flex items-center space-x-2 mt-1">
                <Sprout className="w-4 h-4 text-slate-400" />
                <span
                  className={`text-sm font-medium ${
                    !user?.primary_crop ? 'text-slate-400 italic' : 'text-slate-800'
                  }`}
                >
                  {user?.primary_crop || 'Not provided'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
