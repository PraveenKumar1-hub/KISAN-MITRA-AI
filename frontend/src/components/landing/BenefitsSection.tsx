import { CheckCircle } from 'lucide-react';

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
