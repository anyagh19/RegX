import React, { useState, useEffect } from 'react';
import { Database, ArrowLeft, Tag, Binary, BarChart3, Check, ChevronRight, Info, AlertCircle } from 'lucide-react';
import api from '../../../../api';

function EncodingSelector({ columns, onSubmit, onBack }) {
  const [encodings, setEncodings] = useState({});
  const [availableEncodings, setAvailableEncodings] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState(null);

  useEffect(() => {
    fetchEncodings();
  }, []);

  const fetchEncodings = async () => {
    try {
      const response = await api.get('/analysis/encodings');
      setAvailableEncodings(response.data);
    } catch (error) {
      console.error('Failed to fetch encodings:', error);
    }
  };

  const handleEncodingSelect = (columnName, encodingName) => {
    setEncodings(prev => ({
      ...prev,
      [columnName]: encodingName
    }));
  };

  const getTheme = (category) => {
    const themes = {
      'Basic': { color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: Tag },
      'Advanced': { color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: Binary },
      'Specialized': { color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', icon: BarChart3 }
    };
    return themes[category] || { color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100', icon: Tag };
  };

  const categorizedEncodings = availableEncodings.reduce((acc, encoding) => {
    if (!acc[encoding.category]) acc[encoding.category] = [];
    acc[encoding.category].push(encoding);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto antialiased pb-24">
      {/* Header */}
      <div className="mb-10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-bold tracking-widest uppercase">
          <Database size={12} />
          Step 3: Feature Engineering
        </div>
        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Configure Encoders</h2>
        <p className="text-slate-500">Transform categorical strings into machine-readable mathematical vectors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: List of Data Columns */}
        <div className="lg:col-span-4 space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">Dataset Features</h3>
          {columns.map((column) => (
            <div
              key={column.name}
              onClick={() => setSelectedColumn(column.name)}
              className={`group cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300 relative
                ${selectedColumn === column.name 
                  ? 'bg-white border-indigo-500 shadow-lg translate-x-1' 
                  : 'bg-white/50 border-transparent hover:border-slate-200'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-bold truncate ${selectedColumn === column.name ? 'text-indigo-600' : 'text-slate-700'}`}>
                  {column.name}
                </span>
                {encodings[column.name] && (
                  <div className="bg-indigo-500 text-white p-0.5 rounded-full">
                    <Check size={10} strokeWidth={4} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-bold uppercase tracking-tighter">
                  {column.dataType}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {column.uniqueCount} unique values
                </span>
              </div>
              
              {encodings[column.name] && (
                <div className="mt-2 text-[10px] text-indigo-500 font-semibold italic">
                  Encoder: {availableEncodings.find(e => e.name === encodings[column.name])?.displayName}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Column: Encoding Selection Panel */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[500px] flex flex-col overflow-hidden">
          {selectedColumn ? (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="border-b border-slate-50 pb-6">
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-3">
                  Encoding for <span className="text-indigo-600 underline decoration-indigo-100">{selectedColumn}</span>
                </h3>
                <p className="text-slate-400 text-sm mt-1">Select the most efficient mathematical transformation for this feature.</p>
              </div>

              <div className="space-y-10">
                {Object.entries(categorizedEncodings).map(([category, encodingList]) => {
                  const theme = getTheme(category);
                  const Icon = theme.icon;
                  
                  return (
                    <div key={category} className="space-y-4">
                      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] ${theme.color}`}>
                        <Icon size={14} />
                        {category} Methods
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {encodingList.map((encoding) => {
                          const colData = columns.find(c => c.name === selectedColumn);
                          const isSupported = colData?.isCategorical ? encoding.supportsCategorical : encoding.supportsNumerical;
                          const isSelected = encodings[selectedColumn] === encoding.name;

                          return (
                            <div
                              key={encoding.name}
                              onClick={() => isSupported && handleEncodingSelect(selectedColumn, encoding.name)}
                              className={`p-4 rounded-2xl border-2 transition-all duration-300 relative
                                ${!isSupported ? 'opacity-40 cursor-not-allowed bg-slate-50 border-transparent' : 'cursor-pointer'}
                                ${isSelected ? `${theme.border} bg-white shadow-md ring-2 ring-${theme.color.split('-')[1]}-100` : 'bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-200'}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`font-bold text-sm ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                                  {encoding.displayName}
                                </span>
                                {isSelected && <div className={`w-2 h-2 rounded-full ${theme.color.replace('text', 'bg')}`} />}
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed italic">{encoding.description}</p>
                              
                              {!isSupported && (
                                <div className="mt-3 flex items-center gap-1 text-[9px] font-black text-rose-500 uppercase tracking-tighter">
                                  <AlertCircle size={10} /> Type Mismatch
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 space-y-4">
              <div className="p-6 bg-slate-50 rounded-full">
                <Database size={48} strokeWidth={1} />
              </div>
              <p className="font-medium text-slate-400">Select a column from the list to begin</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Banner & Action Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-50">
        <div className="bg-slate-900 text-white rounded-[2rem] p-4 shadow-2xl flex items-center justify-between gap-6 overflow-hidden relative">
          {/* Subtle Progress Background */}
          <div 
            className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-1000" 
            style={{ width: `${(Object.keys(encodings).length / columns.length) * 100}%` }}
          />

          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="p-3 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="hidden md:block">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Selected Encodings</div>
              <div className="text-sm font-bold tabular-nums">
                {Object.keys(encodings).length} of {columns.length} features mapped
              </div>
            </div>
          </div>

          <button 
            onClick={() => onSubmit(encodings)}
            disabled={Object.keys(encodings).length === 0}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all duration-300
              ${Object.keys(encodings).length > 0 
                ? 'bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/20 active:scale-95' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
          >
            Apply & Continue
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default EncodingSelector;