import { useNavigate } from 'react-router-dom';
import { Leaf, Droplet, Sun, Activity, Database } from 'lucide-react';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-slate-50 pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary-100 opacity-50 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-earth-100 opacity-50 blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-6">
              <Leaf size={16} />
              <span>Smart Farming. Better Decisions.</span>
            </div>
            
            <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
              Your Intelligent <br className="hidden lg:block"/>
              <span className="text-primary-600">Farming Partner</span>
            </h1>
            
            <p className="mt-6 text-base text-slate-600 sm:text-lg md:mt-8 md:text-xl md:max-w-3xl">
              Kisan Mitra AI combines agricultural data, artificial intelligence, weather intelligence, crop insights and disease detection to help farmers make smarter decisions.
            </p>
            
            <div className="mt-8 sm:flex sm:justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 shadow-sm transition-all hover:shadow-md"
              >
                Get Started
              </button>
              <a 
                href="#features"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border-2 border-slate-200 text-base font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 md:py-4 md:text-lg md:px-10 transition-all"
              >
                Explore Features
              </a>
            </div>
          </div>
          
          {/* Right side visual */}
          <div className="mt-16 lg:mt-0 lg:col-span-6 relative">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 relative z-10 overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-transparent opacity-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
              
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Farm Overview</h3>
                  <p className="text-sm text-slate-500">Real-time intelligence</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary-600" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center space-x-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <Sun className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Weather Favorable</p>
                    <p className="text-xs text-slate-500">Perfect conditions for sowing</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center space-x-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <Activity className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Crop Health: 96%</p>
                    <p className="text-xs text-slate-500">No immediate risks detected</p>
                  </div>
                </div>
                
                <div className="bg-primary-600 p-4 rounded-xl shadow-sm flex items-start space-x-4">
                  <div className="bg-white/20 p-2 rounded-lg mt-1">
                    <Droplet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">AI Recommendation</p>
                    <p className="text-xs text-primary-100 leading-relaxed">
                      Schedule irrigation in the next 24 hours to maintain optimal soil moisture levels for wheat crop.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative background blocks */}
            <div className="absolute inset-0 bg-primary-100 rounded-2xl transform translate-x-4 translate-y-4 -z-20"></div>
            <div className="absolute inset-0 border-2 border-earth-200 rounded-2xl transform -translate-x-4 -translate-y-4 -z-20"></div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
