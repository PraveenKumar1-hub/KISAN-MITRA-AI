import { Outlet, Link } from "react-router-dom";
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
