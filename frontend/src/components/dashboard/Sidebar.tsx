import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Tractor,
  Sprout,
  Activity,
  CloudSun,
  Droplets,
  TrendingUp,
  Bot,
  Bell,
  User,
  LogOut,
  X,
  Leaf
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavItem {
  name: string;
  to: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'My Farm', to: '/my-farm', icon: Tractor },
  { name: 'Crop Advisory', to: '/crop-advisory', icon: Sprout },
  { name: 'Plant Health', to: '/plant-health', icon: Activity },
  { name: 'Weather', to: '/weather', icon: CloudSun },
  { name: 'Irrigation', to: '/irrigation', icon: Droplets },
  { name: 'Market Prices', to: '/market-prices', icon: TrendingUp },
  { name: 'AI Assistant', to: '/ai-assistant', icon: Bot },
  { name: 'Notifications', to: '/notifications', icon: Bell },
  { name: 'Profile', to: '/profile', icon: User },
];

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Logo & Mobile Close */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
        <NavLink
          to="/dashboard"
          onClick={closeMobile}
          className="flex items-center space-x-2.5 group"
        >
          <div className="bg-primary-600 text-white p-2 rounded-lg shadow-sm flex items-center justify-center group-hover:bg-primary-700 transition-colors">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight block leading-tight">
              Kisan Mitra AI
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              AgriTech Platform
            </span>
          </div>
        </NavLink>

        {mobileOpen && (
          <button
            type="button"
            onClick={closeMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 font-medium rounded bg-slate-100 text-slate-500">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-100">
        <button
          type="button"
          onClick={handleLogout}
          id="sidebar-logout-btn"
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile drawer backdrop and slide-over */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-50 shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
