import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MyFarm from "./pages/MyFarm";
import CropAdvisory from "./pages/CropAdvisory";
import PlantHealth from "./pages/PlantHealth";
import AIAssistant from "./pages/AIAssistant";
import Weather from "./pages/Weather";
import MarketPrices from "./pages/MarketPrices";
import Notifications from "./pages/Notifications";
import Irrigation from "./pages/Irrigation";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Landing & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          
          {/* Protected Farmer Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/my-farm" element={<MyFarm />} />
              <Route path="/crop-advisory" element={<CropAdvisory />} />
              <Route path="/crop-recommendation" element={<CropAdvisory />} />
              <Route path="/plant-health" element={<PlantHealth />} />
              <Route path="/disease-detection" element={<PlantHealth />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/irrigation" element={<Irrigation />} />
              <Route path="/market-prices" element={<MarketPrices />} />
              <Route path="/market" element={<MarketPrices />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Profile />} />
              {/* Fallback inside dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
