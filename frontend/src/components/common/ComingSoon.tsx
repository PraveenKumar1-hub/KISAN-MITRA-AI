import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  category: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  plannedFeatures: string[];
}

export default function ComingSoon({
  title,
  category,
  icon: Icon,
  iconColor,
  iconBg,
  plannedFeatures,
}: ComingSoonProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb / Back Link */}
      <div className="flex items-center space-x-2 text-sm text-slate-500">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-slate-600 hover:text-primary-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Dashboard
        </Link>
        <span>/</span>
        <span className="text-slate-400">{category}</span>
        <span>/</span>
        <span className="text-slate-700 font-medium">{title}</span>
      </div>

      {/* Main Feature Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 shadow-xs`}>
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {title}
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="w-3 h-3 mr-1 text-amber-600" />
                  Under Development
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {category} Module · Kisan Mitra AI Platform
              </p>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Dashboard
          </Link>
        </div>

        {/* Feature Development Notice */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50/70 p-5 sm:p-6 text-slate-700">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Feature under development
              </h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                This module will be connected to real agricultural data and AI services in the next development stage.
              </p>
            </div>
          </div>
        </div>

        {/* Planned Capabilities Section */}
        <div className="mt-6">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs text-slate-400 mb-3">
            Planned Technical Capabilities
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plannedFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2.5 p-3 rounded-lg border border-slate-100 bg-white"
              >
                <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-slate-600">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
