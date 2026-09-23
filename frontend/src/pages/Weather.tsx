import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCurrentWeather } from '../services/weatherService';
import type { WeatherResponse } from '../types/weather';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudSnow,
  Droplets,
  Wind,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function Weather() {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCurrentWeather();
      setData(res);
      if (!res.success || !res.current) {
        setError(res.message || 'Weather information is temporarily unavailable.');
      }
    } catch (err: any) {
      console.error('Weather load error:', err);
      if (err.response?.status === 401) {
        setError('Your session has expired or requires authentication. Please log in again.');
      } else {
        setError('Weather information is temporarily unavailable.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return { icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50' };
    if (code === 2) return { icon: CloudSun, color: 'text-amber-600', bg: 'bg-amber-50' };
    if (code === 3) return { icon: Cloud, color: 'text-slate-500', bg: 'bg-slate-100' };
    if (code === 45 || code === 48) return { icon: CloudFog, color: 'text-slate-400', bg: 'bg-slate-100' };
    if (code >= 51 && code <= 57) return { icon: CloudDrizzle, color: 'text-blue-500', bg: 'bg-blue-50' };
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
      return { icon: CloudRain, color: 'text-blue-600', bg: 'bg-blue-50' };
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86))
      return { icon: CloudSnow, color: 'text-cyan-500', bg: 'bg-cyan-50' };
    if (code >= 95) return { icon: CloudLightning, color: 'text-purple-600', bg: 'bg-purple-50' };
    return { icon: CloudSun, color: 'text-amber-500', bg: 'bg-amber-50' };
  };

  const formatDayLabel = (dateStr: string, index: number) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const isLocationIssue =
    data?.error_type === 'missing_location' || data?.error_type === 'location_unresolved';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Weather Intelligence
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Weather information to help you plan farm activities.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start">
          <button
            type="button"
            onClick={loadWeather}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors disabled:opacity-60"
            title="Refresh weather data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6 animate-pulse">
          <div className="bg-white rounded-xl border border-slate-200 p-6 h-56 flex flex-col justify-center space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="h-12 bg-slate-100 rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-14 bg-slate-50 rounded"></div>
              <div className="h-14 bg-slate-50 rounded"></div>
              <div className="h-14 bg-slate-50 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-36"></div>
            ))}
          </div>
          <div className="h-32 bg-white rounded-xl border border-slate-200 p-5"></div>
        </div>
      )}

      {/* Error & Location Resolution Failure State */}
      {!loading && error && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-lg mx-auto shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {isLocationIssue ? 'Location Requirement' : 'Weather Unavailable'}
          </h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {error}
          </p>

          <div className="pt-2 flex justify-center gap-3">
            {isLocationIssue ? (
              <Link
                to="/my-farm"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <span>Update Farm Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={loadWeather}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Weather Data Display */}
      {!loading && data && data.success && data.current && (
        <div className="space-y-6">
          {/* Section 1: Current Weather Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                {/* Left: Location & Condition */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-800">
                      {data.resolved_location || data.location}
                    </span>
                    {data.coordinates && (
                      <span className="text-[11px] text-slate-400">
                        ({data.coordinates.latitude.toFixed(2)}°N, {data.coordinates.longitude.toFixed(2)}°E)
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline space-x-3">
                    <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                      {data.current.temperature}°C
                    </span>
                    <span className="text-sm text-slate-500">
                      Feels like {data.current.apparent_temperature}°C
                    </span>
                  </div>

                  <p className="text-base font-semibold text-slate-700">
                    {data.current.weather_condition}
                  </p>
                </div>

                {/* Right: Weather Icon & Timestamp */}
                <div className="flex items-center space-x-4">
                  {(() => {
                    const iconConfig = getWeatherIcon(data.current.weather_code);
                    const WeatherIcon = iconConfig.icon;
                    return (
                      <div className={`w-20 h-20 rounded-2xl ${iconConfig.bg} ${iconConfig.color} flex items-center justify-center shadow-xs`}>
                        <WeatherIcon className="w-10 h-10" />
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Sub-parameters: Humidity, Wind, Rain */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400 block">Relative Humidity</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                      {data.current.humidity}%
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400 block">Wind Speed</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                      {data.current.wind_speed} km/h
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <CloudRain className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400 block">Precipitation</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                      {data.current.rainfall} mm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: 5-Day Forecast */}
          {data.forecast && data.forecast.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">5-Day Forecast</h3>
                <span className="text-xs text-slate-500 font-medium">Daily Agro-Weather</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {data.forecast.slice(0, 5).map((item, idx) => {
                  const iconConfig = getWeatherIcon(item.weather_code);
                  const Icon = iconConfig.icon;

                  return (
                    <div
                      key={item.date}
                      className={`bg-white border rounded-xl p-4 shadow-xs flex flex-col justify-between ${
                        idx === 0 ? 'border-primary-300 ring-1 ring-primary-200' : 'border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            {formatDayLabel(item.date, idx)}
                          </span>
                          {idx === 0 && (
                            <span className="text-[10px] font-semibold text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded">
                              Current
                            </span>
                          )}
                        </div>

                        <div className="my-3 flex items-center justify-center">
                          <div className={`p-2.5 rounded-xl ${iconConfig.bg} ${iconConfig.color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                        </div>

                        <p className="text-xs font-semibold text-slate-700 text-center truncate" title={item.weather_condition}>
                          {item.weather_condition}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">
                            {item.temp_max !== null ? `${item.temp_max}°` : '--'}
                          </span>
                          <span className="text-slate-400">
                            {item.temp_min !== null ? `${item.temp_min}°` : '--'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center">
                            <Droplets className="w-3 h-3 mr-0.5 text-blue-500" />
                            {item.precipitation_probability}%
                          </span>
                          {item.precipitation_sum > 0 && (
                            <span>{item.precipitation_sum} mm</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3 & 4: Farming Insights & Irrigation Advisory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Farming Insights */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Weather-Based Farming Insights
                </h4>
              </div>

              {data.farming_insights && data.farming_insights.length > 0 ? (
                <ul className="space-y-2.5 pt-1">
                  {data.farming_insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{insight}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">
                  Weather conditions are currently suitable for routine farm activities.
                </p>
              )}
            </div>

            {/* Irrigation Advisory */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Irrigation Advisory
                  </h4>
                </div>

                <div className="mt-3 p-4 rounded-lg bg-blue-50/60 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-950 leading-relaxed">
                    {data.irrigation_advisory || 'Check soil moisture before irrigation.'}
                  </p>
                  <Link
                    to="/irrigation"
                    className="mt-2.5 inline-flex items-center text-[11px] font-semibold text-primary-700 hover:text-primary-800 hover:underline"
                  >
                    Open Smart Irrigation Advisory &rarr;
                  </Link>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Updated {data.updated_at || 'recently'}
                </span>
                <span>Source: Open-Meteo API</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
