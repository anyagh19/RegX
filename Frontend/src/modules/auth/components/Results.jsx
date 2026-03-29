import React from 'react';
import { Sparkles, Download, RotateCcw, Award, TrendingUp, Target, ChevronRight, BarChart3 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

function Results({ results, selectedCharts, targetColumn, onRestart }) {
  // Mock data for charts - in a real app, 'results.chartData' would come from your backend
  const chartData = results.chartData || [
    { name: 'Jan', value: 400, accuracy: 0.85 },
    { name: 'Feb', value: 300, accuracy: 0.88 },
    { name: 'Mar', value: 600, accuracy: 0.92 },
    { name: 'Apr', value: 800, accuracy: 0.90 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const getMetricColor = (value, metricName) => {
    const name = metricName.toLowerCase();
    if (name.includes('accuracy') || name.includes('score') || name.includes('f1')) {
      if (value >= 0.9) return 'text-emerald-500';
      if (value >= 0.7) return 'text-sky-500';
      return 'text-amber-500';
    }
    return 'text-indigo-500';
  };

  // Helper to render the actual chart based on string name
  const renderChart = (chartType) => {
    switch (chartType) {
      case 'Bar Chart':
      case 'Comparison':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'Line Chart':
      case 'Trend/Time-Series':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={3} dot={{r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff'}} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'Pie Chart':
      case 'Composition':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <div className="h-[300px] flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <BarChart3 className="text-slate-300 mb-2" size={40} />
            <p className="text-slate-400 text-sm">Visualizing {chartType}...</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 antialiased">
      {/* Hero Header */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 mb-8 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 shadow-inner">
            <Sparkles size={40} />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Analysis Complete</h2>
            <p className="text-slate-500 text-lg">Model trained on <span className="text-indigo-600 font-semibold">{targetColumn}</span> successfully.</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={onRestart} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all">
            <RotateCcw size={18} /> New Analysis
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-black hover:bg-slate-800 text-white rounded-2xl font-bold transition-all shadow-xl shadow-black/10">
            <Download size={18} /> Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Metrics & Info */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Model Stats */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Award className="text-indigo-500" size={20} />
              <h3 className="font-bold uppercase tracking-widest text-xs text-slate-400">Model Details</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Algorithm', value: results.algorithm },
                { label: 'Model Type', value: results.modelType },
                { label: 'Target', value: targetColumn }
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                  <span className="text-slate-500 text-sm">{item.label}</span>
                  <span className="font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl">
            <div className="flex items-center gap-3 mb-8 text-slate-400">
              <TrendingUp size={20} />
              <h3 className="font-bold uppercase tracking-widest text-xs">Core Performance</h3>
            </div>
            <div className="grid gap-6">
              {Object.entries(results.metrics).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-400 text-xs font-medium uppercase tracking-tighter">{key}</span>
                    <span className={`text-2xl font-black ${getMetricColor(value, key)}`}>
                      {typeof value === 'number' ? (value * 100).toFixed(1) + '%' : value}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-1000" 
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Charts & Importance */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Real Dynamic Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedCharts.map((chart) => (
              <div key={chart} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-bold text-slate-800">{chart}</h4>
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                    <ChevronRight size={14} />
                  </div>
                </div>
                {renderChart(chart)}
              </div>
            ))}
          </div>

          {/* Feature Importance Bar Chart */}
          {results.featureImportance && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Target className="text-indigo-500" size={24} />
                <h3 className="text-xl font-bold text-slate-900">Feature Importance</h3>
              </div>
              <div className="space-y-5">
                {Object.entries(results.featureImportance)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([feature, importance]) => (
                    <div key={feature} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-slate-700">{feature}</span>
                        <span className="text-slate-400 font-bold">{(importance * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full" 
                          style={{ width: `${importance * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Results;