import os

base_dir = "c:/Users/Praveen/Documents/KISAN-MITRA-AI/frontend/src"
landing_components_dir = os.path.join(base_dir, "components", "landing")

os.makedirs(landing_components_dir, exist_ok=True)

# 1. Navbar
navbar_code = """import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Menu, X, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'AI Solutions', href: '#ai-solutions' },
    { name: 'About', href: '#footer' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-primary-600 p-2 rounded-lg text-white">
              <Leaf size={24} />
            </div>
            <span className={`text-xl font-bold tracking-tight ${isScrolled ? 'text-slate-900' : 'text-slate-900 lg:text-white'}`}>
              Kisan Mitra AI
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className={`text-sm font-medium transition-colors ${isScrolled ? 'text-slate-600 hover:text-primary-600' : 'text-slate-800 lg:text-slate-100 lg:hover:text-white'}`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => navigate('/login')}
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${isScrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-800 lg:text-slate-100 lg:hover:bg-white/10'}`}
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="text-sm font-medium px-5 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm flex items-center space-x-1"
            >
              <span>Get Started</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-md ${isScrolled ? 'text-slate-600' : 'text-slate-800 lg:text-white'}`}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg absolute w-full left-0 mt-3">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-primary-600 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 flex flex-col space-y-3 px-3">
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                className="w-full text-center px-4 py-3 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
              >
                Login
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}
                className="w-full text-center px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
"""
with open(os.path.join(landing_components_dir, "Navbar.tsx"), "w") as f: f.write(navbar_code)

# 2. Hero Section
hero_code = """import { useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, Droplet, Sun, Activity, Database } from 'lucide-react';

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
"""
with open(os.path.join(landing_components_dir, "HeroSection.tsx"), "w") as f: f.write(hero_code)

# 3. Features
features_code = """import { Map, Activity, MessageSquare, Sun, Droplet, BarChart2 } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      title: 'Crop Recommendation',
      description: 'Get crop recommendations based on soil, weather and environmental conditions.',
      icon: Map,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Plant Disease Detection',
      description: 'Analyze plant leaf images and identify possible diseases using AI-based computer vision.',
      icon: Activity,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50'
    },
    {
      title: 'AI Agricultural Assistant',
      description: 'Ask agriculture-related questions and receive AI-powered guidance.',
      icon: MessageSquare,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    {
      title: 'Weather Intelligence',
      description: 'Understand weather conditions and receive farming-related weather insights.',
      icon: Sun,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Smart Irrigation',
      description: 'Get irrigation recommendations based on crop, soil and weather conditions.',
      icon: Droplet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Market Insights',
      description: 'Track agricultural market information and understand price trends.',
      icon: BarChart2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Core Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Everything You Need for Smarter Farming
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto">
            Comprehensive tools designed to modernize your agricultural workflow and improve decision making.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.bgColor} ${feature.color} mb-5`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
"""
with open(os.path.join(landing_components_dir, "FeaturesSection.tsx"), "w") as f: f.write(features_code)

# 4. AI Solutions
ai_solutions = """import { Brain, Camera, Bot } from 'lucide-react';

export default function AISolutionsSection() {
  return (
    <div id="ai-solutions" className="py-20 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            AI-Powered Agricultural Intelligence
          </h2>
          <p className="mt-4 text-xl text-slate-600">
            Advanced machine learning algorithms providing actionable insights.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
            <div className="h-2 bg-emerald-500 w-full"></div>
            <div className="p-8">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <Brain size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Crop Intelligence</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3"></span>Soil analysis</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3"></span>Environmental parameters</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3"></span>Crop recommendation</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3"></span>Explainable recommendation</li>
              </ul>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
            <div className="h-2 bg-rose-500 w-full"></div>
            <div className="p-8">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-6 group-hover:scale-110 transition-transform">
                <Camera size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Plant Health Intelligence</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-3"></span>Upload leaf image</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-3"></span>AI-based disease detection</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-3"></span>Confidence score & Symptoms</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-3"></span>Prevention guidance</li>
              </ul>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
            <div className="h-2 bg-primary-500 w-full"></div>
            <div className="p-8">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-6 group-hover:scale-110 transition-transform">
                <Bot size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Agricultural AI Assistant</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-3"></span>Ask farming questions</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-3"></span>Hindi/English/Hinglish support</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-3"></span>Context-aware responses</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-3"></span>Agriculture knowledge base</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"""
with open(os.path.join(landing_components_dir, "AISolutionsSection.tsx"), "w") as f: f.write(ai_solutions)

# 5. How It Works
how_it_works = """import { User, Database, Cpu, Lightbulb } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Create Your Farm Profile',
      description: 'Add crop, location, soil and irrigation information.',
      icon: User
    },
    {
      num: '02',
      title: 'Provide Farm Information',
      description: 'Enter soil, weather and crop-related information.',
      icon: Database
    },
    {
      num: '03',
      title: 'AI Analyzes Your Data',
      description: 'The system processes the available agricultural information.',
      icon: Cpu
    },
    {
      num: '04',
      title: 'Get Personalized Insights',
      description: 'Receive crop, disease, weather and irrigation recommendations.',
      icon: Lightbulb
    }
  ];

  return (
    <div id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            How It Works
          </h2>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-full border-4 border-slate-50 shadow-sm flex items-center justify-center text-primary-600 mb-6">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Step {step.num}: {step.title}</h3>
                  <p className="text-slate-600 max-w-xs">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
"""
with open(os.path.join(landing_components_dir, "HowItWorksSection.tsx"), "w") as f: f.write(how_it_works)

# 6. Previews
previews = """import { Image as ImageIcon, AlertCircle, CheckCircle, ShieldAlert, Sun, CloudRain, Wind, Droplets } from 'lucide-react';

export default function PreviewsSection() {
  return (
    <div className="py-20 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        
        {/* Disease Detection Preview */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Plant Disease Detection</h2>
            <p className="text-lg text-slate-600 mb-8">
              Early detection prevents severe crop damage. Upload an image of a symptomatic leaf, and our vision models will analyze it instantly.
            </p>
          </div>
          
          <div className="bg-white p-1 rounded-2xl shadow-xl border border-slate-200">
            <div className="bg-slate-50 border-b border-slate-100 p-4 rounded-t-xl flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Demo Preview</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-1/3 bg-slate-100 aspect-square rounded-lg flex items-center justify-center">
                  <ImageIcon className="text-slate-400 w-12 h-12" />
                </div>
                <div className="w-full sm:w-2/3 space-y-4">
                  <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-start justify-between">
                    <div>
                      <p className="text-xs text-rose-600 font-medium uppercase tracking-wide">Sample UI Data</p>
                      <h4 className="text-lg font-bold text-rose-900 mt-1">Tomato – Early Blight</h4>
                    </div>
                    <div className="bg-white px-2 py-1 rounded text-rose-700 font-bold text-sm shadow-sm">
                      92% Match
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm flex items-start text-slate-700"><AlertCircle size={16} className="text-amber-500 mr-2 mt-0.5 shrink-0"/> <span className="font-semibold mr-1">Symptoms:</span> Dark concentric rings on older leaves.</p>
                    <p className="text-sm flex items-start text-slate-700"><ShieldAlert size={16} className="text-emerald-600 mr-2 mt-0.5 shrink-0"/> <span className="font-semibold mr-1">Action:</span> Remove infected lower leaves immediately.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weather & Irrigation */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center flex-col-reverse flex lg:flex-row">
          <div className="bg-white p-1 rounded-2xl shadow-xl border border-slate-200 w-full">
            <div className="bg-slate-50 border-b border-slate-100 p-4 rounded-t-xl flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Demo Preview</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center space-x-2 text-blue-700 mb-2">
                    <CloudRain size={18} />
                    <span className="font-semibold text-sm">Precipitation</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">40%</p>
                  <p className="text-xs text-blue-600 mt-1">Expected in 4 hours</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <div className="flex items-center space-x-2 text-amber-700 mb-2">
                    <Sun size={18} />
                    <span className="font-semibold text-sm">Temperature</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-900">32°C</p>
                  <p className="text-xs text-amber-600 mt-1">High humidity (75%)</p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Droplets className="text-primary-600" />
                  <h4 className="font-bold text-slate-900">Irrigation Advisory</h4>
                </div>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-primary-600 font-semibold block mb-1">Recommendation: Delay Irrigation</span>
                  Soil moisture is currently adequate (45%). With a 40% chance of rain today, watering now may lead to waterlogging.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8 lg:mb-0">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Weather & Irrigation</h2>
            <p className="text-lg text-slate-600 mb-8">
              Combine localized weather forecasts with crop data to optimize your watering schedules, saving resources and preventing over-irrigation.
            </p>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Interactive AI Assistant</h2>
            <p className="text-lg text-slate-600 mb-8">
              Got a question? Ask our AI assistant. It provides context-aware guidance in English, Hindi, or Hinglish based on agricultural best practices.
            </p>
          </div>
          
          <div className="bg-white p-1 rounded-2xl shadow-xl border border-slate-200">
            <div className="bg-slate-50 border-b border-slate-100 p-4 rounded-t-xl flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">AI Assistant Preview</span>
            </div>
            <div className="p-6 space-y-4">
              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-primary-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[80%] text-sm shadow-sm">
                  When should I irrigate my wheat crop?
                </div>
              </div>
              {/* AI message */}
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-800 p-4 rounded-2xl rounded-tl-sm max-w-[90%] text-sm border border-slate-200 shadow-sm leading-relaxed">
                  Based on the available farm and weather information, irrigation timing can be adjusted according to soil moisture, crop growth stage and expected rainfall. For wheat at the tillering stage in your region, wait 2-3 days as light showers are expected.
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
"""
with open(os.path.join(landing_components_dir, "PreviewsSection.tsx"), "w") as f: f.write(previews)

# 7. Benefits
benefits = """import { CheckCircle } from 'lucide-react';

export default function BenefitsSection() {
  const benefits = [
    "Data-driven decisions",
    "Early plant disease awareness",
    "Better irrigation planning",
    "Weather-aware farming",
    "Easy access to agricultural information",
    "Explainable AI recommendations",
    "Farmer-friendly interface"
  ];

  return (
    <div className="py-20 bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold sm:text-4xl mb-12">
          Built to Make Farming Decisions Simpler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex items-center space-x-3 bg-primary-800/50 p-4 rounded-xl border border-primary-700">
              <CheckCircle className="text-primary-400 shrink-0" size={20} />
              <span className="font-medium">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
"""
with open(os.path.join(landing_components_dir, "BenefitsSection.tsx"), "w") as f: f.write(benefits)

# 8. CTA and Footer
cta_footer = """import { useNavigate } from 'react-router-dom';
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
"""
with open(os.path.join(landing_components_dir, "CTA_Footer.tsx"), "w") as f: f.write(cta_footer)

# 9. Landing Page
landing_page = """import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import AISolutionsSection from '../components/landing/AISolutionsSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import PreviewsSection from '../components/landing/PreviewsSection';
import BenefitsSection from '../components/landing/BenefitsSection';
import { CTASection, Footer } from '../components/landing/CTA_Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AISolutionsSection />
        <HowItWorksSection />
        <PreviewsSection />
        <BenefitsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
"""
with open(os.path.join(base_dir, "pages", "LandingPage.tsx"), "w") as f: f.write(landing_page)

print("Landing page scaffolding complete.")
