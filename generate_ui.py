import os

base_dir = "c:/Users/Praveen/Documents/KISAN-MITRA-AI/frontend/src"

directories = [
    "components", "components/ui", "pages", "layouts", "hooks", "utils"
]

for d in directories:
    os.makedirs(os.path.join(base_dir, d), exist_ok=True)

# 1. Main Layout
dashboard_layout = """import { Outlet, Link } from "react-router-dom";
import { Home, User, Sun, Droplet, Activity, Map, Settings, Bell, BarChart2 } from "lucide-react";

export default function DashboardLayout() {
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
            <Link to="/notifications"><Bell className="w-5 h-5 hover:text-primary-600 transition-colors" /></Link>
            <Link to="/settings"><Settings className="w-5 h-5 hover:text-primary-600 transition-colors" /></Link>
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-bold">
              FM
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
"""
with open(os.path.join(base_dir, "layouts", "DashboardLayout.tsx"), "w") as f: f.write(dashboard_layout)

auth_layout = """import { Outlet } from "react-router-dom";
export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-primary-800 mb-6 flex justify-center items-center gap-2">
          Kisan Mitra AI
        </h1>
        <Outlet />
      </div>
    </div>
  );
}"""
with open(os.path.join(base_dir, "layouts", "AuthLayout.tsx"), "w") as f: f.write(auth_layout)

# 2. UI Components
card = """export function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>{children}</div>;
}"""
with open(os.path.join(base_dir, "components/ui", "Card.tsx"), "w") as f: f.write(card)

# 3. Pages
pages = [
    "LandingPage", "Login", "Register", "Dashboard", "Profile", 
    "CropRecommendation", "DiseaseDetection", "AIAssistant", "Weather", 
    "Irrigation", "MarketPrices", "AIInsights", "Notifications", "Settings", "AdminDashboard"
]

for p in pages:
    content = f"""export default function {p}() {{
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">{p}</h1>
      <p className="text-slate-600">This is a placeholder for the {p} UI.</p>
    </div>
  );
}}
"""
    with open(os.path.join(base_dir, "pages", f"{p}.tsx"), "w") as f: f.write(content)

# 4. App.tsx and Routing
app_tsx = """import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CropRecommendation from "./pages/CropRecommendation";
import DiseaseDetection from "./pages/DiseaseDetection";
import AIAssistant from "./pages/AIAssistant";
import Weather from "./pages/Weather";
import Irrigation from "./pages/Irrigation";
import MarketPrices from "./pages/MarketPrices";
import AIInsights from "./pages/AIInsights";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/crop-recommendation" element={<CropRecommendation />} />
          <Route path="/disease-detection" element={<DiseaseDetection />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/irrigation" element={<Irrigation />} />
          <Route path="/market" element={<MarketPrices />} />
          <Route path="/insights" element={<AIInsights />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
"""
with open(os.path.join(base_dir, "App.tsx"), "w") as f: f.write(app_tsx)

print("UI scaffolding complete.")
