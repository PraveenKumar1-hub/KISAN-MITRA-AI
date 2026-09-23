import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Tractor,
  MapPin,
  Maximize2,
  Layers,
  Droplets,
  Sprout,
  CheckCircle2,
  AlertCircle,
  User,
  Info,
  Edit3,
  X,
  Save,
  RefreshCw
} from 'lucide-react';
import { fetchFarmDetails, updateFarmDetails } from '../services/farmService';
import type { FarmDetails } from '../services/farmService';
import toast from 'react-hot-toast';

export default function MyFarm() {
  const { user, updateUser } = useAuth();
  const [farmData, setFarmData] = useState<FarmDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Edit form state
  const [formData, setFormData] = useState({
    location: '',
    farm_size: '',
    soil_type: '',
    irrigation_type: '',
    primary_crop: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchFarmDetails();
      setFarmData(data);
      setFormData({
        location: data.location || '',
        farm_size: data.farm_size || '',
        soil_type: data.soil_type || '',
        irrigation_type: data.irrigation_type || '',
        primary_crop: data.primary_crop || '',
      });
    } catch (err: unknown) {
      console.error('Error fetching farm details:', err);
      // Fallback to auth user if offline
      if (user) {
        setFarmData({
          full_name: user.full_name,
          farm_size: user.farm_size,
          location: user.location,
          soil_type: user.soil_type,
          irrigation_type: user.irrigation_type,
          primary_crop: user.primary_crop,
        });
        setFormData({
          location: user.location || '',
          farm_size: user.farm_size || '',
          soil_type: user.soil_type || '',
          irrigation_type: user.irrigation_type || '',
          primary_crop: user.primary_crop || '',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location.trim()) {
      toast.error('Location is required');
      return;
    }
    if (!formData.farm_size.trim()) {
      toast.error('Farm Size is required');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateFarmDetails({
        location: formData.location.trim(),
        farm_size: formData.farm_size.trim(),
        soil_type: formData.soil_type.trim() || undefined,
        irrigation_type: formData.irrigation_type.trim() || undefined,
        primary_crop: formData.primary_crop.trim() || undefined,
      });

      setFarmData(updated);
      updateUser({
        location: updated.location,
        farm_size: updated.farm_size,
        soil_type: updated.soil_type,
        irrigation_type: updated.irrigation_type,
        primary_crop: updated.primary_crop,
      });

      setIsEditing(false);
      toast.success('Farm parameters updated successfully!');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        toast.error(detail);
      } else if (Array.isArray(detail)) {
        toast.error(detail.map((d: any) => d.msg || 'Invalid field').join(', '));
      } else {
        toast.error('Failed to update farm parameters');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getFarmSizeText = (size?: string | null) => {
    if (!size || !size.trim()) return 'Not provided';
    return size.toLowerCase().includes('acre') ? size : `${size} Acres`;
  };

  const currentFarm = farmData || user;

  const fields = [
    {
      key: 'farm_size',
      label: 'Farm Size',
      value: getFarmSizeText(currentFarm?.farm_size),
      isProvided: Boolean(currentFarm?.farm_size && currentFarm.farm_size.trim()),
      icon: Maximize2,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      key: 'location',
      label: 'Location',
      value: currentFarm?.location?.trim() || 'Not provided',
      isProvided: Boolean(currentFarm?.location && currentFarm.location.trim()),
      icon: MapPin,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      key: 'soil_type',
      label: 'Soil Type',
      value: currentFarm?.soil_type?.trim() || 'Not provided',
      isProvided: Boolean(currentFarm?.soil_type && currentFarm.soil_type.trim()),
      icon: Layers,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
    },
    {
      key: 'irrigation_type',
      label: 'Irrigation Type',
      value: currentFarm?.irrigation_type?.trim() || 'Not provided',
      isProvided: Boolean(currentFarm?.irrigation_type && currentFarm.irrigation_type.trim()),
      icon: Droplets,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      key: 'primary_crop',
      label: 'Primary Crop',
      value: currentFarm?.primary_crop?.trim() || 'Not provided',
      isProvided: Boolean(currentFarm?.primary_crop && currentFarm.primary_crop.trim()),
      icon: Sprout,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  const providedCount = fields.filter((f) => f.isProvided).length;
  const totalCount = fields.length;

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-44 bg-slate-100 rounded-xl" />
        <div className="h-64 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Farm
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Registered agricultural parcel details and parameter configuration.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            {isEditing ? (
              <>
                <X className="w-3.5 h-3.5 text-slate-500" />
                Cancel Editing
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-primary-600" />
                Edit Farm Parameters
              </>
            )}
          </button>
          <div className="flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200">
            <Tractor className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-semibold text-slate-700">
              {currentFarm?.full_name || 'Farmer'}&apos;s Holding
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form Modal/Drawer if isEditing is true */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-xl border border-primary-200 shadow-sm p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-primary-50 text-primary-700 rounded-md">
                <Edit3 className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">Update Farm Parameters</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Changes persist to database</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location (District, State) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Anand, Gujarat"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Farm Size (Acres) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.farm_size}
                onChange={(e) => setFormData({ ...formData, farm_size: e.target.value })}
                placeholder="e.g. 5"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Soil Type
              </label>
              <input
                type="text"
                value={formData.soil_type}
                onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
                placeholder="e.g. Alluvial, Black, Loamy"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Irrigation System
              </label>
              <input
                type="text"
                value={formData.irrigation_type}
                onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}
                placeholder="e.g. Drip, Sprinkler, Canal, Flood"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Crop
              </label>
              <input
                type="text"
                value={formData.primary_crop}
                onChange={(e) => setFormData({ ...formData, primary_crop: e.target.value })}
                placeholder="e.g. Groundnut, Wheat, Cotton"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Farm Information Status Overview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Farm Information Status</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Profile completeness of your registered agricultural parameters
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
            {providedCount} of {totalCount} Parameters Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {fields.map((field) => (
            <div
              key={field.key}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/60"
            >
              <div className="flex items-center space-x-2.5">
                <field.icon className={`w-4 h-4 ${field.color}`} />
                <span className="text-xs font-medium text-slate-700">{field.label}</span>
              </div>
              {field.isProvided ? (
                <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                  Available
                </span>
              ) : (
                <span className="inline-flex items-center text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <AlertCircle className="w-3 h-3 mr-1 text-amber-600" />
                  Not provided
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-primary-50/60 border border-primary-100 p-3.5 flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-primary-700 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-primary-900 leading-relaxed">
            These registered farm parameters are utilized across Crop Advisory, Smart Irrigation, and Weather Intelligence modules to generate tailored field recommendations.
          </p>
        </div>
      </div>

      {/* Farm Details Cards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Farm Details</h3>
          <p className="text-xs text-slate-500">
            Current values recorded in your account
          </p>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/40">
            <span className="text-xs font-medium text-slate-400 block">Registered Farmer</span>
            <div className="flex items-center space-x-2.5 mt-2">
              <div className="p-2 rounded-lg bg-primary-50 text-primary-700">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-900">
                {currentFarm?.full_name || 'Not provided'}
              </span>
            </div>
          </div>

          {fields.map((field) => (
            <div
              key={field.key}
              className="p-4 rounded-lg border border-slate-100 bg-slate-50/40"
            >
              <span className="text-xs font-medium text-slate-400 block">{field.label}</span>
              <div className="flex items-center space-x-2.5 mt-2">
                <div className={`p-2 rounded-lg ${field.bg} ${field.color}`}>
                  <field.icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-sm font-bold ${
                    field.isProvided ? 'text-slate-900' : 'text-slate-400 italic font-normal'
                  }`}
                >
                  {field.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
