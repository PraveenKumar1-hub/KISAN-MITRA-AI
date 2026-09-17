import { Image as ImageIcon, AlertCircle, ShieldAlert, Sun, CloudRain, Droplets } from 'lucide-react';

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
                      <h4 className="text-lg font-bold text-rose-900 mt-1">Tomato - Early Blight</h4>
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
