import { Outlet, Link, useNavigate } from "react-router-dom";
import { Home, User, Sun, Droplet, Activity, Map, Settings, Bell, BarChart2, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return "KM";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-800 text-white flex flex-col">
        <div className="p-4 font-bold text-xl flex items-center space-x-2 border-b border-primary-700">
          <Droplet className="w-6 h-6 text-primary-300" />
          <span>Kisan Mitra AI</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center space-x-3 p-2 hover:bg-primary-700 rounded-md transition-colors"><Home size={20}/> <span>Dashboard</span></Link>
          <Link to="/crop-recommendation" className="flex items-center space-x-3 p-2 hover:bg-primary-700 rounded-md transition-colors"><Map size={20}/> <span>Crop AI</span></Link>
          <Link to="/disease-detection" className="flex items-center space-x-3 p-2 hover:bg-primary-700 rounded-md transition-colors"><Activity size={20}/> <span>Disease AI</span></Link>
          <Link to="/weather" className="flex items-center space-x-3 p-2 hover:bg-primary-700 rounded-md transition-colors"><Sun size={20}/> <span>Weather</span></Link>
          <Link to="/irrigation" className="flex items-center space-x-3 p-2 hover:bg-primary-700 rounded-md transition-colors"><Droplet size={20}/> <span>Irrigation</span></Link>
          <Link to="/market" className="flex items-center space-x-3 p-2 hover:bg-primary-700 rounded-md transition-colors"><BarChart2 size={20}/> <span>Market</span></Link>
          <Link to="/profile" className="flex items-center space-x-3 p-2 hover:bg-primary-700 rounded-md transition-colors"><User size={20}/> <span>Profile</span></Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold text-slate-800">Overview</h2>
          <div className="flex items-center space-x-4 text-slate-500">
            <Link to="/notifications" title="Notifications">
              <Bell className="w-5 h-5 hover:text-primary-600 transition-colors" />
            </Link>
            <Link to="/settings" title="Settings">
              <Settings className="w-5 h-5 hover:text-primary-600 transition-colors" />
            </Link>
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div 
                className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-bold text-xs"
                title={user?.full_name || "Farmer"}
              >
                {getInitials(user?.full_name)}
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:inline">
                {user?.full_name || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors ml-2"
                title="Logout"
                id="logout-btn"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

