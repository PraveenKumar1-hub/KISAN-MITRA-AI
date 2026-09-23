import { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  ArrowLeft,
  CheckCheck,
  Check,
  RefreshCw,
  AlertTriangle,
  CloudSun,
  Droplets,
  Sprout,
  ShieldAlert,
  TrendingUp,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../services/notificationService';
import type { NotificationItem } from '../services/notificationService';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async (isManual = false) => {
    if (isManual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await fetchNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unread_count);
    } catch (err: unknown) {
      console.error('Error fetching notifications:', err);
      setError('Unable to retrieve notifications. Please verify backend connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      const updated = await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: updated.is_read } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success('Notification marked as read');
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      toast.error('Failed to update notification status');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      toast.error('Failed to update notifications');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'weather':
        return <CloudSun className="w-4 h-4 text-sky-600" />;
      case 'irrigation':
        return <Droplets className="w-4 h-4 text-blue-600" />;
      case 'crop':
      case 'advisory':
        return <Sprout className="w-4 h-4 text-emerald-600" />;
      case 'plant_health':
      case 'disease':
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case 'market':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-sm text-slate-500 mb-1">
            <Link
              to="/dashboard"
              className="inline-flex items-center text-slate-600 hover:text-primary-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Notifications
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Agricultural alerts, weather warnings, and platform advisories.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => loadNotifications(true)}
            disabled={refreshing}
            className="p-2 bg-white text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary-600' : ''}`} />
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}

          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <Bell className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">
              {unreadCount} Unread
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-20 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-white rounded-xl border border-red-200 shadow-xs p-8 text-center">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Unable to load notifications</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{error}</p>
          <button
            type="button"
            onClick={() => loadNotifications(true)}
            className="mt-4 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Empty State (Truthful) */}
      {!loading && !error && notifications.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
            <BellOff className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No new notifications.
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            Alerts regarding weather warnings, crop advisories, and mandi price fluctuations will appear here as services generate notifications.
          </p>
        </div>
      )}

      {/* Populated Notifications List */}
      {!loading && !error && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 rounded-xl border transition-colors shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                n.is_read
                  ? 'bg-white border-slate-200/80 text-slate-700'
                  : 'bg-emerald-50/40 border-emerald-200/90 text-slate-900'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <span className="p-2 bg-white border border-slate-200/70 rounded-lg shrink-0 shadow-2xs">
                  {getCategoryIcon(n.category)}
                </span>
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {n.category}
                    </span>
                    {!n.is_read && (
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                    <span className="text-[11px] text-slate-600 font-mono">
                      {formatTimestamp(n.created_at)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              </div>

              {!n.is_read && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(n.id)}
                  className="self-start sm:self-center shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
