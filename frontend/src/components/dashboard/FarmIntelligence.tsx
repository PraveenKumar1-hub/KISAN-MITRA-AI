import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  RefreshCw,
  AlertTriangle,
  Droplets,
  CloudSun,
  Sprout,
  ShieldAlert,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { fetchFarmInsights } from '../../services/insights';
import type { FarmIntelligenceResponse, InsightItem, RecommendedAction } from '../../services/insights';

export default function FarmIntelligence() {
  const [data, setData] = useState<FarmIntelligenceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadInsights = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await fetchFarmInsights();
      setData(res);
    } catch (err: unknown) {
      console.error('Error fetching farm intelligence:', err);
      setError('Unable to load farm intelligence. Please verify backend connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Medium Priority
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Favorable / Normal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
            Informational
          </span>
        );
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'weather':
        return <CloudSun className="w-5 h-5 text-sky-600" />;
      case 'irrigation':
        return <Droplets className="w-5 h-5 text-blue-600" />;
      case 'crop':
        return <Sprout className="w-5 h-5 text-emerald-600" />;
      case 'plant_health':
        return <ShieldAlert className="w-5 h-5 text-amber-600" />;
      case 'market':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      default:
        return <Compass className="w-5 h-5 text-primary-600" />;
    }
  };

  const getSourceStatusBadge = (status: string, label: string) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {label}
          </span>
        );
      case 'unavailable':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            {label}
          </span>
        );
      case 'not_analyzed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            {label}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-5 w-44 bg-slate-200 rounded animate-pulse" />
            <div className="h-3.5 w-64 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="h-8 w-28 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="h-20 bg-slate-50 border border-slate-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-28 bg-slate-50 border border-slate-100 rounded-lg animate-pulse" />
          <div className="h-28 bg-slate-50 border border-slate-100 rounded-lg animate-pulse" />
          <div className="h-28 bg-slate-50 border border-slate-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs text-center">
        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <h4 className="text-sm font-bold text-slate-900">Farm Intelligence Temporarily Offline</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          {error || 'Unable to consolidate agricultural insights at this time.'}
        </p>
        <button
          type="button"
          onClick={() => loadInsights(true)}
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Compass className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Farm Intelligence</h2>
            <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
              Live Decision Support
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Your consolidated agricultural situation at a glance</p>
        </div>

        <button
          type="button"
          onClick={() => loadInsights(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Insights'}
        </button>
      </div>

      {/* 2. Today's Farm Summary */}
      <div className="bg-gradient-to-r from-emerald-50/70 via-slate-50 to-primary-50/50 border border-emerald-100/80 rounded-xl p-4 sm:p-5 relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Today's Farm Summary</h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Updated {data.generated_at}
              </span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-normal">
              {data.summary}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Priority Recommended Actions */}
      {data.actions && data.actions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Priority Actions ({data.actions.length})
            </h3>
            <span className="text-[11px] text-slate-500">Key steps for today's field management</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {data.actions.map((act: RecommendedAction) => (
              <div
                key={act.id}
                className="bg-slate-50/70 hover:bg-white border border-slate-200/90 rounded-xl p-4 transition-all duration-150 flex flex-col justify-between group shadow-2xs hover:shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {act.category}
                    </span>
                    {getPriorityBadge(act.priority)}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-primary-700 transition-colors line-clamp-1">
                    {act.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {act.short_explanation}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(act.action_route)}
                  className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800 pt-2 border-t border-slate-200/70 w-full justify-between"
                >
                  <span>{act.action_label}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Categorized Detailed Insights Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Module Intelligence Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.insights.map((ins: InsightItem) => (
            <div
              key={ins.id}
              className="border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between bg-white hover:border-slate-300 transition-colors shadow-2xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-slate-50 border border-slate-100 rounded-md">
                      {getCategoryIcon(ins.type)}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {ins.type.replace('_', ' ')}
                    </span>
                  </div>
                  {getPriorityBadge(ins.priority)}
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {ins.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {ins.message}
                </p>

                {ins.reasons && ins.reasons.length > 0 && (
                  <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Contributing Factors:
                    </span>
                    <ul className="text-[11px] text-slate-600 space-y-0.5 list-disc list-inside">
                      {ins.reasons.map((r, i) => (
                        <li key={i} className="line-clamp-1">{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-600">Source: {ins.source_name}</span>
                {ins.action_route && (
                  <button
                    type="button"
                    onClick={() => navigate(ins.action_route!)}
                    className="font-semibold text-primary-700 hover:text-primary-800 inline-flex items-center gap-1"
                  >
                    <span>{ins.action_label || 'View'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Data Source Transparency Status */}
      <div className="bg-slate-50/60 rounded-xl border border-slate-200/60 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Contributing Feeds & Model Status
          </div>
          <span className="text-[11px] text-slate-600">Zero fake indicators</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          {Object.entries(data.data_sources).map(([key, src]) => (
            <div key={key} className="bg-white border border-slate-200/80 rounded-lg p-2.5 space-y-1">
              <span className="text-[11px] font-bold text-slate-700 block truncate">{src.name}</span>
              <div>{getSourceStatusBadge(src.status, src.label)}</div>
              {src.details && (
                <p className="text-[10px] text-slate-600 truncate" title={src.details}>
                  {src.details}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
