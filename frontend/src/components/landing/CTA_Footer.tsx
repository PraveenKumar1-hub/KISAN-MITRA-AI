import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export function CTASection() {
  const navigate = useNavigate();
  return (
    <div className="bg-white py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-6">
          Ready to Farm Smarter?
        </h2>
        <p className="text-xl text-slate-600 mb-10">
          Build better farming decisions with intelligent agricultural insights.
        </p>
        <button 
          onClick={() => navigate('/register')}
          className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-md transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer id="footer" className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary-600 p-1.5 rounded-md text-white">
                <Leaf size={20} />
              </div>
              <span className="text-xl font-bold text-slate-900">Kisan Mitra AI</span>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              "Smart Farming. Better Decisions."
            </p>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-8">
              B.Tech Major Project
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-sm text-slate-600 hover:text-primary-600">Features</a></li>
              <li><a href="#ai-solutions" className="text-sm text-slate-600 hover:text-primary-600">AI Solutions</a></li>
              <li><a href="#how-it-works" className="text-sm text-slate-600 hover:text-primary-600">How it Works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-slate-600 hover:text-primary-600">About</a></li>
              <li><a href="#" className="text-sm text-slate-600 hover:text-primary-600">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Kisan Mitra AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
