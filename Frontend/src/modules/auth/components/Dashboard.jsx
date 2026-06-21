import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  BrainCircuit,
  TrendingUp,
  Database,
  ArrowRight,
  Zap,
  Target,
  Activity,
} from 'lucide-react';

const Dashboard = () => {
  // Minimal summary stats – could be live data
  const overviewStats = [
    {
      label: 'Model Accuracy',
      value: '94.2%',
      icon: <Target size={18} className="text-emerald-400" />,
    },
    {
      label: 'Features Used',
      value: '12',
      icon: <Database size={18} className="text-blue-400" />,
    },
    {
      label: 'Last Trained',
      value: '2h ago',
      icon: <Activity size={18} className="text-purple-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-8 font-sans">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent pointer-events-none" />

      {/* Main Card Container */}
      <div className="relative w-full max-w-4xl mx-auto bg-[#0F172A]/80 backdrop-blur-2xl border border-slate-800/60 shadow-2xl shadow-black/20 rounded-3xl p-10 md:p-14 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide mb-2">
            <Zap size={14} className="text-blue-400" />
            v2.0 Now Available
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Regression Studio
          </h1>
          <p className="text-slate-400 text-lg font-medium">
            Precision modeling, powered by your choice.
          </p>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {overviewStats.map((stat, i) => (
            <div
              key={i}
              className="group bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-700 hover:bg-slate-900/60 transition-all"
            >
              <div className="p-3 bg-slate-800 rounded-xl">{stat.icon}</div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Two Big Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Manual Analysis Card */}
          <NavLink
            to="/analysis"
            className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/70 p-8 text-left hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full" />
            <div className="relative z-10 space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 flex items-center justify-center">
                <BarChart3 size={24} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Manual Analysis</h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  Hands‑on control over features, parameters, and deep exploration.
                </p>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm group-hover:gap-3 transition-all">
                Start exploring
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </NavLink>

          {/* AI Insights Card */}
          <NavLink
            to="/upload"
            className="group relative overflow-hidden rounded-3xl border border-purple-500/10 bg-gradient-to-br from-purple-900/20 to-slate-900/70 p-8 text-left hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full" />
            <div className="relative z-10 space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center">
                <BrainCircuit size={24} className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">AI Insights</h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  AutoML, pattern detection, and smart recommendations.
                </p>
              </div>
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm group-hover:gap-3 transition-all">
                Discover insights
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </NavLink>
        </div>

        {/* Subtle footer note */}
        <p className="text-center text-xs text-slate-600">
          Select a mode to begin building your regression model.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;