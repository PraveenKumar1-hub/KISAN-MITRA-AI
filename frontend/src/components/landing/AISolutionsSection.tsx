import { Brain, Camera, Bot } from 'lucide-react';

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
