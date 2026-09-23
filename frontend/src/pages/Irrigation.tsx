import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchIrrigationAdvisory } from '../services/irrigationService';
import type { IrrigationAdvisoryResponse } from '../types/irrigation';
import {
  Droplets,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sprout,
  Sun,
  ArrowRight,
  Info,
  History
} from 'lucide-react';

export default function Irrigation() {
  const [data, setData] = useState<IrrigationAdvisoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdvisory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchIrrigationAdvisory();
      setData(res);
      if (!res.success && res.status === 'insufficient_data') {
        // Handled cleanly within page UI
      }
    } catch (err: any) {
      console.error('Irrigation advisory load error:', err);
      if (err.response?.status === 401) {
        setError('Your session has expired or requires authentication. Please log in again.');
      } else {
        setError('Irrigation advisory is temporarily unavailable. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvisory();
  }, []);

  const getStatusVisuals = (status: string) => {
    switch (status) {
      case 'delay':
        return {
          icon: Clock,
          color: 'text-amber-700',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 'needed':
        return {
          icon: Droplets,
          color: 'text-emerald-700',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'check_moisture':
        return {
          icon: CheckCircle2,
          color: 'text-blue-700',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-slate-600',
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
        };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Smart Irrigation
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Plan irrigation using your farm conditions and weather information.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start">
          <button
            type="button"
            onClick={loadAdvisory}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors disabled:opacity-60"
            title="Refresh irrigation advisory"
            id="refresh-irrigation-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary-600' : 'text-slate-500'}`} />
            <span>Refresh Advisory</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6 animate-pulse">
          <div className="bg-white rounded-xl border border-slate-200 p-6 h-48 flex flex-col justify-center space-y-3">
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            <div className="h-8 bg-slate-50 rounded w-1/4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 h-52"></div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 h-52"></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-white border border-red-200 rounded-xl p-8 text-center max-w-lg mx-auto shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Advisory Unavailable</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">{error}</p>
          <div className="pt-2">
            <button
              type="button"
              onClick={loadAdvisory}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Main Data Content */}
      {!loading && data && (
        <div className="space-y-6">
          {/* Missing Parameters Alert if any */}
          {data.missing_parameters && data.missing_parameters.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Complete your farm profile for a more accurate irrigation advisory.
                  </h4>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Missing parameters: {data.missing_parameters.join(', ')}. Registering these improves water budget accuracy.
                  </p>
                </div>
              </div>
              <Link
                to="/my-farm"
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors flex-shrink-0 flex items-center space-x-1"
              >
                <span>Update Farm Profile</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Section 10: Current Status Card */}
          {(() => {
            const visual = getStatusVisuals(data.status);
            const StatusIcon = visual.icon;

            return (
              <div
                className={`rounded-xl border ${visual.border} ${visual.bg} p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-14 h-14 rounded-2xl bg-white ${visual.color} flex items-center justify-center flex-shrink-0 shadow-2xs border ${visual.border}`}>
                    <StatusIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Irrigation Status
                    </span>
                    <h3 className={`text-xl sm:text-2xl font-bold ${visual.color} mt-0.5`}>
                      {data.status_label}
                    </h3>
                    <p className="text-sm text-slate-700 mt-1 max-w-xl leading-relaxed">
                      {data.recommendation}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${visual.badgeBg}`}>
                    {data.priority} Priority
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Generated {data.generated_at ? data.generated_at.split(' ')[1] : 'recently'}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Section 13: Advisory Card (Rule-based smart advisory) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 rounded-lg bg-primary-50 text-primary-700">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Rule-Based Smart Advisory
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Deterministic moisture balance evaluation
                  </span>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Priority: {data.priority}
              </span>
            </div>

            <div className="p-4 rounded-lg bg-slate-50/70 border border-slate-100">
              <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider text-[10px]">
                Recommendation
              </span>
              <p className="text-sm font-semibold text-slate-800 mt-1 leading-relaxed">
                {data.recommendation}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Why this recommendation was generated:
              </span>
              <ul className="space-y-2">
                {data.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sections 11 & 12: Weather Summary & Farm Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weather Summary */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                    <Sun className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Weather Summary</h4>
                </div>
                <Link
                  to="/weather"
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                >
                  <span>Detailed Weather</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {data.weather_summary ? (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-slate-50/60 border border-slate-100">
                    <span className="text-[11px] text-slate-400 block">Temperature</span>
                    <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                      {data.weather_summary.temperature}°C
                    </span>
                    <span className="text-[10px] text-slate-500">{data.weather_summary.weather_condition}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50/60 border border-slate-100">
                    <span className="text-[11px] text-slate-400 block">Humidity</span>
                    <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                      {data.weather_summary.humidity}%
                    </span>
                    <span className="text-[10px] text-slate-500">Relative Humidity</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50/60 border border-slate-100">
                    <span className="text-[11px] text-slate-400 block">Rain Probability</span>
                    <span className="text-sm font-bold text-blue-700 mt-0.5 block">
                      {data.weather_summary.rain_probability}%
                    </span>
                    <span className="text-[10px] text-slate-500">Next 48h maximum</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50/60 border border-slate-100">
                    <span className="text-[11px] text-slate-400 block">Expected Rainfall</span>
                    <span className="text-sm font-bold text-blue-700 mt-0.5 block">
                      {data.weather_summary.expected_rainfall_48h} mm
                    </span>
                    <span className="text-[10px] text-slate-500">Next 48h projection</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Weather data is currently unavailable.</p>
              )}
            </div>

            {/* Farm Conditions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Farm Conditions</h4>
                </div>
                <Link
                  to="/my-farm"
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                >
                  <span>My Farm</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-slate-50/60 border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Primary Crop</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block truncate" title={data.farm_summary.crop}>
                    {data.farm_summary.crop}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50/60 border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Soil Type</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block truncate" title={data.farm_summary.soil_type}>
                    {data.farm_summary.soil_type}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50/60 border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Irrigation System</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block truncate" title={data.farm_summary.irrigation_type}>
                    {data.farm_summary.irrigation_type}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50/60 border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Farm Size</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">
                    {data.farm_summary.farm_size.toLowerCase().includes('acre')
                      ? data.farm_summary.farm_size
                      : `${data.farm_summary.farm_size} Acres`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 14: Irrigation History Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                  <History className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Irrigation History</h4>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Logged Advisories</span>
            </div>

            {data.history && data.history.length > 0 ? (
              <div className="space-y-2.5">
                {data.history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-800">{item.status_label}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-200/80 text-slate-700 rounded font-semibold">
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">{item.recommendation}</p>
                    </div>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap self-start sm:self-auto">
                      {item.created_at}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">
                <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">No irrigation history available yet.</p>
              </div>
            )}
          </div>

          {/* Professional Disclaimer */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 flex items-start space-x-3 text-slate-600">
            <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-slate-500">
              This advisory provides guidance based on transparent agronomic rules and real-time agro-meteorological conditions. Always verify field conditions and root zone soil moisture before operating irrigation equipment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
