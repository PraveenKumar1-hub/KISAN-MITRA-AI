import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, MapPin, Database, Sprout, Droplets, Leaf } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
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
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      try {
        const payload = {
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          location: formData.location,
          farm_size: formData.farmSize,
          soil_type: formData.soilType || undefined,
          irrigation_type: formData.irrigationType || undefined,
          primary_crop: formData.primaryCrop || undefined,
        };
        await api.post('/api/auth/register', payload);
        toast.success('Registration successful! Please login.');
        navigate('/login');
      } catch (error: any) {
        if (error.response?.data?.detail) {
          toast.error(error.response.data.detail);
        } else {
          toast.error('Network error or server unreachable');
        }
      } finally {
        setIsSubmitting(false);
      }
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
                  placeholder="********"
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
                  placeholder="********"
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
