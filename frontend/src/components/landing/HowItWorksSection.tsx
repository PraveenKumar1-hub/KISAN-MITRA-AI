import { User, Database, Cpu, Lightbulb } from 'lucide-react';

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
