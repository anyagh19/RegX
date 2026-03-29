import React, { useState, useEffect } from 'react';
import { ChartBar, ArrowLeft, BarChart3, LineChart, PieChart, Activity, Check, ChevronRight } from 'lucide-react';
import api from '../../../../api';

function ChartSelector({ onSelect, onBack }) {
  const [chartTypes, setChartTypes] = useState({});
  const [selectedCharts, setSelectedCharts] = useState([]);

  useEffect(() => {
    fetchChartTypes();
  }, []);

  const fetchChartTypes = async () => {
    try {
      const response = await api.get('/analysis/charts');
      setChartTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch chart types:', error);
    }
  };

  const toggleChart = (chartName) => {
    setSelectedCharts(prev => 
      prev.includes(chartName)
        ? prev.filter(c => c !== chartName)
        : [...prev, chartName]
    );
  };

  const categories = {
    'Comparison': { icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    'Trend/Time-Series': { icon: LineChart, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    'Distribution': { icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    'Composition': { icon: PieChart, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
    'Advanced': { icon: ChartBar, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' }
  };

  return (
    <div className="max-w-5xl mx-auto antialiased pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold tracking-wider uppercase">
            <ChartBar size={14} />
            Step 5: Visual Insights
          </div>
          <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Choose Visualizations</h2>
          <p className="text-slate-500">Select the charts you'd like to include in your final report.</p>
        </div>

        {/* Selection Counter Badge */}
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
            {selectedCharts.length}
          </div>
          <span className="text-sm font-medium text-slate-600 tracking-tight">Charts Selected</span>
        </div>
      </div>

      {/* Categories Content */}
      <div className="space-y-12">
        {Object.entries(chartTypes).map(([category, charts]) => {
          const cat = categories[category] || categories['Advanced'];
          const Icon = cat.icon;

          return (
            <section key={category} className="space-y-5">
              <div className="flex items-center gap-3 ml-2">
                <div className={`p-2 rounded-lg ${cat.bg} ${cat.color}`}>
                  <Icon size={18} strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-slate-800 tracking-tight underline-offset-8 decoration-slate-200 uppercase text-xs tracking-[0.15em]">
                  {category}
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {charts.map(chartName => {
                  const isSelected = selectedCharts.includes(chartName);
                  return (
                    <div
                      key={chartName}
                      onClick={() => toggleChart(chartName)}
                      className={`relative overflow-hidden cursor-pointer group rounded-2xl p-5 border-2 transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)]
                        ${isSelected 
                          ? `bg-white ${cat.border} shadow-lg -translate-y-1` 
                          : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md shadow-sm'
                        }`}
                    >
                      <div className="flex flex-col gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                          ${isSelected ? cat.bg : 'bg-slate-50 group-hover:bg-white'}`}>
                          <Icon size={20} className={isSelected ? cat.color : 'text-slate-400'} />
                        </div>
                        
                        <span className={`text-sm font-semibold tracking-tight transition-colors
                          ${isSelected ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                          {chartName}
                        </span>
                      </div>

                      {/* Apple-style Check Indicator */}
                      {isSelected && (
                        <div className={`absolute top-3 right-3 w-5 h-5 rounded-full ${cat.color.replace('text', 'bg')} text-white flex items-center justify-center animate-in zoom-in duration-300 shadow-sm`}>
                          <Check size={12} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Sticky Bottom Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50">
        <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl p-3 flex items-center justify-between gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 text-slate-500 font-semibold hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <button 
            onClick={() => selectedCharts.length > 0 && onSelect(selectedCharts)}
            disabled={selectedCharts.length === 0}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold transition-all duration-500
              ${selectedCharts.length > 0 
                ? 'bg-black text-white hover:bg-slate-800 shadow-xl active:scale-95' 
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
          >
            <span>Generate Results</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChartSelector;