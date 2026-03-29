import React, { useState } from 'react';
import { Target, ArrowLeft, Info, TrendingUp, Hash, Type, Search, ChevronRight } from 'lucide-react';

function ColumnSelector({ columns, onSelect, onBack }) {
  const [selectedColumn, setSelectedColumn] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredColumns = columns.filter(col =>
    col.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getColumnIcon = (dataType) => {
    if (dataType === 'Numeric') return <Hash size={18} className="text-emerald-500" />;
    return <Type size={18} className="text-rose-500" />;
  };

  const getThemeColor = (dataType) => {
    return dataType === 'Numeric' ? 'emerald' : 'rose';
  };

  return (
    <div className="max-w-5xl mx-auto antialiased">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-wider uppercase">
            <Target size={14} />
            Step 2: Define Goal
          </div>
          <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Select Target Column</h2>
          <p className="text-slate-500">Choose the variable your model will learn to predict.</p>
        </div>

        {/* Search Bar */}
        <div className="relative group w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Filter columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all placeholder:text-slate-400 shadow-sm"
          />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {filteredColumns.map((column) => {
          const isSelected = selectedColumn === column.name;
          const theme = getThemeColor(column.dataType);
          
          return (
            <div
              key={column.name}
              onClick={() => setSelectedColumn(column.name)}
              className={`relative group cursor-pointer rounded-[1.8rem] p-6 transition-all duration-500 border-2
                ${isSelected 
                  ? `bg-white border-${theme}-500 shadow-2xl shadow-${theme}-100 -translate-y-1` 
                  : 'bg-white border-transparent hover:border-slate-200 hover:shadow-xl shadow-sm border-slate-100'
                }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-2xl bg-slate-50 transition-colors ${isSelected ? `bg-${theme}-50` : ''}`}>
                  {getColumnIcon(column.dataType)}
                </div>
                {isSelected && (
                  <div className={`bg-${theme}-500 text-white p-1 rounded-full animate-in zoom-in duration-300`}>
                    <Target size={14} strokeWidth={3} />
                  </div>
                )}
              </div>

              <div className="space-y-1 mb-4">
                <h3 className="font-bold text-slate-800 text-lg truncate">{column.name}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-widest text-${theme}-500`}>
                  {column.dataType}
                </span>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Unique</span>
                  <span className="text-sm font-semibold text-slate-700">{column.uniqueCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Missing</span>
                  <span className={`text-sm font-semibold ${column.nullCount > 0 ? 'text-amber-500' : 'text-slate-700'}`}>
                    {column.nullCount}
                  </span>
                </div>
              </div>

              {/* Extended Numeric Stats */}
              {column.dataType === 'Numeric' && (
                <div className={`mt-4 p-3 rounded-xl transition-colors ${isSelected ? `bg-${theme}-50/50` : 'bg-slate-50/50'}`}>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <TrendingUp size={12} />
                    <span className="font-medium tabular-nums">
                      {column.min?.toFixed(1)} <span className="text-slate-300 mx-1">→</span> {column.max?.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredColumns.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
          <div className="p-4 bg-slate-50 rounded-full text-slate-300 mb-4">
            <Search size={40} />
          </div>
          <p className="text-slate-500 font-medium">No columns match your search</p>
        </div>
      )}

      {/* Action Footer */}
      <div className="sticky bottom-8 flex items-center justify-between bg-white/80 backdrop-blur-xl border border-slate-200/50 p-4 rounded-[2rem] shadow-2xl">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 text-slate-600 font-semibold hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        
        <div className="hidden md:flex items-center gap-3 text-slate-400">
          <Info size={16} />
          <span className="text-xs font-medium italic">Your target represents the "Label" for supervised learning.</span>
        </div>

        <button 
          onClick={() => selectedColumn && onSelect(selectedColumn)}
          disabled={!selectedColumn}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-300
            ${selectedColumn 
              ? 'bg-black text-white hover:bg-slate-800 shadow-lg active:scale-95' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
        >
          Continue
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default ColumnSelector;