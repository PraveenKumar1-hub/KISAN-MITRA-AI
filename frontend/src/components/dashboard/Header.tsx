import { Menu, Bell, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'KM';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Left Side: Mobile Menu Button + Title/Subtitle */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Open navigation menu"
            id="mobile-menu-btn"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              Farmer Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
              Your farm information and agricultural insights in one place.
            </p>
          </div>
        </div>

        {/* Right Side: Notifications & Farmer Profile */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Notification Button */}
          <Link
            to="/notifications"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="sr-only">Notifications</span>
          </Link>

          {/* Farmer Profile Pill */}
          <Link
            to="/profile"
            className="flex items-center space-x-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
            title="View Profile"
          >
            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-xs border border-primary-200 shadow-2xs">
              {user?.full_name ? getInitials(user.full_name) : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-sm font-semibold text-slate-800 block leading-tight">
                {user?.full_name || 'Farmer'}
              </span>
              <span className="text-[11px] text-slate-500 block leading-tight">
                {user?.location || 'Registered Farmer'}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
