import { Map, Activity, MessageSquare, Sun, Droplet, BarChart2 } from 'lucide-react';

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
