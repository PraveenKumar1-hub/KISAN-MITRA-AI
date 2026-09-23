import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchCropRecommendations } from '../services/cropAdvisoryService';
import type { CropAdvisoryResponse } from '../types/cropAdvisory';
import {
  Sprout,
  MapPin,
  Maximize2,
  Layers,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
  Calendar,
  Waves,
  RefreshCw,
  Tractor,
  RotateCcw
} from 'lucide-react';

export default function CropAdvisory() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CropAdvisoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    location: user?.location || '',
    farm_size: user?.farm_size || '',
    soil_type: user?.soil_type || '',
    irrigation_type: user?.irrigation_type || '',
    primary_crop: user?.primary_crop || '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        location: prev.location || user.location || '',
        farm_size: prev.farm_size || user.farm_size || '',
        soil_type: prev.soil_type || user.soil_type || '',
        irrigation_type: prev.irrigation_type || user.irrigation_type || '',
        primary_crop: prev.primary_crop || user.primary_crop || '',
      }));
    }
  }, [user]);

  const handleResetToProfile = () => {
    if (user) {
      setFormData({
        location: user.location || '',
        farm_size: user.farm_size || '',
        soil_type: user.soil_type || '',
        irrigation_type: user.irrigation_type || '',
        primary_crop: user.primary_crop || '',
      });
      setError(null);
    }
  };

  const handleGetRecommendations = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    // Frontend validation
    if (!formData.soil_type.trim()) {
      setError('Soil Type is required to generate crop recommendations.');
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required to generate crop recommendations.');
      return;
    }

    if (formData.farm_size.trim()) {
      const cleanPart = formData.farm_size.trim().split(' ')[0];
      const parsed = parseFloat(cleanPart);
      if (isNaN(parsed) || parsed <= 0) {
        setError('Farm size must be a valid positive number.');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetchCropRecommendations({
        location: formData.location.trim(),
        farm_size: formData.farm_size.trim(),
        soil_type: formData.soil_type.trim(),
        irrigation_type: formData.irrigation_type.trim(),
        primary_crop: formData.primary_crop.trim(),
      });
      setData(res);
    } catch (err: any) {
      console.error('Failed to load crop recommendations', err);
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d: any) => d.msg || 'Validation error').join(', '));
      } else {
        setError('Unable to generate recommendations right now. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Missing parameter checks based on active form inputs
  const missingParameters: string[] = [];
  if (!formData.soil_type.trim()) missingParameters.push('Soil Type');
  if (!formData.irrigation_type.trim()) missingParameters.push('Irrigation Type');
  if (!formData.location.trim()) missingParameters.push('Location');
  if (!formData.farm_size.trim()) missingParameters.push('Farm Size');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            AI Crop Advisory
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Get crop recommendations based on your farm conditions.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 self-start shadow-2xs">
          <Sprout className="w-4 h-4 text-primary-600" />
          <span className="text-xs font-semibold text-slate-700">Agronomic Rules Engine</span>
        </div>
      </div>

      {/* Section A: Farm Input Form */}
      <form onSubmit={handleGetRecommendations} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Farm Advisory Inputs</h3>
            <p className="text-xs text-slate-500">
              Input farm parameters used for rule-based recommendation matching
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleResetToProfile}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center space-x-1"
              title="Reset inputs to saved profile values"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Profile</span>
            </button>
            <span className="text-slate-300">|</span>
            <Link
              to="/my-farm"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center space-x-1"
            >
              <span>View Farm Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Location */}
            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex flex-col justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <label htmlFor="crop-input-location" className="text-xs font-medium text-slate-500">
                  Location *
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="crop-input-location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Anand, Gujarat"
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Farm Size */}
            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex flex-col justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-md bg-teal-50 text-teal-600">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
                <label htmlFor="crop-input-farm-size" className="text-xs font-medium text-slate-500">
                  Farm Size
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="crop-input-farm-size"
                  type="text"
                  value={formData.farm_size}
                  onChange={(e) => setFormData(p => ({ ...p, farm_size: e.target.value }))}
                  placeholder="e.g. 5 Acres"
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Soil Type */}
            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex flex-col justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-md bg-amber-50 text-amber-700">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <label htmlFor="crop-select-soil" className="text-xs font-medium text-slate-500">
                  Soil Type *
                </label>
              </div>
              <div className="mt-2">
                <select
                  id="crop-select-soil"
                  value={formData.soil_type}
                  onChange={(e) => setFormData(p => ({ ...p, soil_type: e.target.value }))}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-md px-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Select Soil</option>
                  <option value="Alluvial">Alluvial</option>
                  <option value="Black">Black</option>
                  <option value="Clay">Clay</option>
                  <option value="Clay Loam">Clay Loam</option>
                  <option value="Loamy">Loamy</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                  <option value="Red">Red</option>
                  <option value="Sandy">Sandy</option>
                  <option value="Silty Clay">Silty Clay</option>
                </select>
              </div>
            </div>

            {/* Irrigation Type */}
            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex flex-col justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                  <Droplets className="w-3.5 h-3.5" />
                </div>
                <label htmlFor="crop-select-irrigation" className="text-xs font-medium text-slate-500">
                  Irrigation Type
                </label>
              </div>
              <div className="mt-2">
                <select
                  id="crop-select-irrigation"
                  value={formData.irrigation_type}
                  onChange={(e) => setFormData(p => ({ ...p, irrigation_type: e.target.value }))}
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-md px-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Select Irrigation</option>
                  <option value="Drip">Drip</option>
                  <option value="Sprinkler">Sprinkler</option>
                  <option value="Canal">Canal</option>
                  <option value="Borewell">Borewell</option>
                  <option value="Tubewell">Tubewell</option>
                  <option value="Well">Well</option>
                  <option value="Flood">Flood</option>
                  <option value="Rainfed">Rainfed</option>
                </select>
              </div>
            </div>

            {/* Primary Crop */}
            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex flex-col justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-md bg-green-50 text-green-600">
                  <Sprout className="w-3.5 h-3.5" />
                </div>
                <label htmlFor="crop-input-primary-crop" className="text-xs font-medium text-slate-500">
                  Primary Crop
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="crop-input-primary-crop"
                  type="text"
                  value={formData.primary_crop}
                  onChange={(e) => setFormData(p => ({ ...p, primary_crop: e.target.value }))}
                  placeholder="e.g. Groundnut"
                  className="w-full text-xs sm:text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Missing Information Notice */}
          {missingParameters.length > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-900">
                    Additional farm information improves recommendation precision.
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Unset parameters: {missingParameters.join(', ')}. Specifying these enables comprehensive matching.
                  </p>
                </div>
              </div>
              <Link
                to="/my-farm"
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
              >
                Update Farm Profile
              </Link>
            </div>
          )}

          {/* Action Trigger Button */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Recommendations evaluate soil compatibility, irrigation requirements, and regional patterns.
            </p>

            <button
              type="submit"
              disabled={loading}
              id="get-recommendations-btn"
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-70 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating Parameters...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{data ? 'Re-analyze Recommendations' : 'Get Recommendations'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={handleGetRecommendations}
            className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 h-72">
                <div className="h-5 bg-slate-200 rounded w-1/2"></div>
                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                <div className="h-16 bg-slate-50 rounded"></div>
                <div className="h-12 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section C: Recommendations Results */}
      {data && !loading && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Top Recommended Crops
              </h3>
              <p className="text-xs text-slate-500">
                Based on the available farm information registered in your profile
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full self-start">
              Top 3 matches
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.recommendations.map((item, index) => {
              const scoreColor =
                item.match_score >= 80
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : item.match_score >= 65
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200';

              return (
                <div
                  key={item.crop}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-primary-300 transition-colors"
                >
                  <div>
                    {/* Header: Rank + Crop Name + Score */}
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Rank #{index + 1} Recommendation
                        </span>
                        <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                          {item.crop}
                        </h4>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${scoreColor}`}
                        >
                          {item.match_score}% Match
                        </span>
                        <span className="block text-[10px] text-slate-500 font-medium mt-1">
                          {item.confidence}
                        </span>
                      </div>
                    </div>

                    {/* Meta Tags: Water + Season */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="inline-flex items-center text-[11px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100">
                        <Waves className="w-3 h-3 mr-1 text-blue-500" />
                        Water: {item.water_requirement}
                      </span>
                      {item.season && (
                        <span className="inline-flex items-center text-[11px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100">
                          <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                          {item.season}
                        </span>
                      )}
                    </div>

                    {/* Why this crop was recommended */}
                    <div className="mt-4">
                      <span className="text-xs font-bold text-slate-700 block mb-1.5">
                        Why this crop was recommended:
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {item.reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 flex-shrink-0 mt-0.5" />
                            <span className="leading-snug">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Cultivation Note */}
                  <div className="mt-4 pt-3 border-t border-slate-100 rounded-lg bg-slate-50/70 p-3">
                    <span className="text-[11px] font-bold text-slate-700 block mb-0.5">
                      Cultivation Note:
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.cultivation_note}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Initial Empty State before clicking button */}
      {!data && !loading && !error && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 sm:p-10 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Tractor className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Ready to Analyze Farm Suitability
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md">
            Click &ldquo;Get Recommendations&rdquo; to evaluate your registered soil type, irrigation system, and location against our agronomic knowledge base.
          </p>
          <button
            type="button"
            onClick={handleGetRecommendations}
            className="mt-4 inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Get Recommendations</span>
          </button>
        </div>
      )}

      {/* Section D: Professional Disclaimer */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 flex items-start space-x-3 text-slate-600">
        <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed text-slate-500">
          These recommendations are based on the farm information currently available in your profile. For final crop selection, consider local agricultural conditions, weather, market demand, and guidance from agricultural experts.
        </p>
      </div>
    </div>
  );
}
