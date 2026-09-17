import os

base_dir = "c:/Users/Praveen/Documents/KISAN-MITRA-AI/frontend/src"

# 1. AuthLayout
auth_layout_code = """import { Outlet, Link } from "react-router-dom";
import { Leaf, ArrowLeft } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Left Side - Branding & Visual */}
      <div className="hidden md:flex md:w-1/2 bg-primary-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center space-x-2 mb-12 hover:opacity-80 transition-opacity">
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Home</span>
          </Link>
          
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Leaf size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Kisan Mitra AI</h1>
          </div>
          
          <p className="text-xl text-primary-100 max-w-md font-light leading-relaxed">
            "Smart Farming. Better Decisions."
          </p>
          <p className="mt-6 text-primary-200 max-w-md">
            Join thousands of farmers making data-driven decisions to improve crop yields and farm sustainability.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary-800 opacity-50 blur-3xl" />
        <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-earth-800 opacity-40 blur-3xl" />
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 bg-white relative">
        {/* Mobile Back Button */}
        <div className="md:hidden absolute top-6 left-6">
          <Link to="/" className="inline-flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Home</span>
          </Link>
        </div>
        
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
"""
with open(os.path.join(base_dir, "layouts", "AuthLayout.tsx"), "w") as f: f.write(auth_layout_code)

# 2. Login Page
login_code = """import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Leaf } from 'lucide-react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        // Normally redirect to dashboard here
        console.log('Login form submitted', formData);
      }, 1000);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center md:text-left">
        <div className="md:hidden flex justify-center mb-4 text-primary-600">
          <Leaf size={40} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</h2>
        <p className="text-slate-500">Sign in to your Kisan Mitra AI account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-primary-500 focus:border-primary-500'} rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors`}
              placeholder="farmer@example.com"
            />
          </div>
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">Forgot Password?</a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-primary-500 focus:border-primary-500'} rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
"""
with open(os.path.join(base_dir, "pages", "Login.tsx"), "w") as f: f.write(login_code)

# 3. Register Page
register_code = """import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, MapPin, Database, Sprout, Droplets, Leaf } from 'lucide-react';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    farmSize: '',
    soilType: '',
    irrigationType: '',
    primaryCrop: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\\S+@\\S+\\.\\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    
    if (!formData.farmSize) newErrors.farmSize = 'Farm Size is required';
    else if (isNaN(Number(formData.farmSize)) || Number(formData.farmSize) <= 0) newErrors.farmSize = 'Must be a valid positive number';

    setErrors(newErrors);
    isValid = Object.keys(newErrors).length === 0;
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        console.log('Registration form submitted', formData);
      }, 1000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <div className="mb-8 text-center md:text-left">
        <div className="md:hidden flex justify-center mb-4 text-primary-600">
          <Leaf size={40} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Create an Account</h2>
        <p className="text-slate-500">Join Kisan Mitra AI to start making smarter farming decisions</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* PERSONAL INFORMATION */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.fullName ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-primary-500'} rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm`}
                  placeholder="Rahul Kumar"
                />
              </div>
              {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-primary-500'} rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm`}
                  placeholder="farmer@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2 border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-primary-500'} rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2 border ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-primary-500'} rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>
        </div>

        {/* FARM INFORMATION */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Farm Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Location / District *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin size={18} />
                </div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.location ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-primary-500'} rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm`}
                  placeholder="e.g. Ludhiana, Punjab"
                />
              </div>
              {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Farm Size (Acres) *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Database size={18} />
                </div>
                <input
                  type="number"
                  step="0.1"
                  name="farmSize"
                  value={formData.farmSize}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.farmSize ? 'border-red-300 focus:ring-red-500' : 'border-slate-300 focus:ring-primary-500'} rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm`}
                  placeholder="5.5"
                />
              </div>
              {errors.farmSize && <p className="mt-1 text-xs text-red-600">{errors.farmSize}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Soil Type</label>
              <div className="relative">
                <select
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleChange}
                  className="block w-full pl-3 pr-10 py-2 border border-slate-300 focus:ring-primary-500 focus:border-primary-500 rounded-lg shadow-sm sm:text-sm bg-white"
                >
                  <option value="">Select Soil Type...</option>
                  <option value="Alluvial">Alluvial</option>
                  <option value="Black">Black Soil</option>
                  <option value="Red">Red Soil</option>
                  <option value="Laterite">Laterite</option>
                  <option value="Desert">Desert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Irrigation Type</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Droplets size={18} />
                </div>
                <select
                  name="irrigationType"
                  value={formData.irrigationType}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2 border border-slate-300 focus:ring-primary-500 focus:border-primary-500 rounded-lg shadow-sm sm:text-sm bg-white"
                >
                  <option value="">Select Irrigation...</option>
                  <option value="Drip">Drip Irrigation</option>
                  <option value="Sprinkler">Sprinkler</option>
                  <option value="Canal">Canal</option>
                  <option value="Tubewell">Tube Well</option>
                  <option value="Rainfed">Rainfed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Primary Crop</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Sprout size={18} />
                </div>
                <input
                  type="text"
                  name="primaryCrop"
                  value={formData.primaryCrop}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 focus:ring-primary-500 focus:border-primary-500 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm"
                  placeholder="e.g. Wheat, Rice, Cotton"
                />
              </div>
            </div>

          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
"""
with open(os.path.join(base_dir, "pages", "Register.tsx"), "w") as f: f.write(register_code)

print("Auth pages generated.")
