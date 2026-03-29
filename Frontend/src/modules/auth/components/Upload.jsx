import React, { useState, useMemo } from 'react';
import api from '../../../../api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { LayoutGrid, TrendingUp, Activity, FileText, AlertCircle } from 'lucide-react';

function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");
    setLoading(true);

    const formData = new FormData();
    formData.append('File', file);

    try {
      const response = await api.post('/Regression/train', formData);
      setResult(response.data);
    } catch (error) {
      console.error("Training failed", error);
      alert("Check if your backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // --- Professional Data Processing ---
  const { chartData, columns, targetKey } = useMemo(() => {
    if (!result || !result.data || result.data.length === 0) return { chartData: [], columns: [], targetKey: "" };

    const firstRow = result.data[0];
    const allKeys = Object.keys(firstRow);
    
    // Dynamically find the "Actual" column (usually contains Price/Value and isn't 'PredictedValue')
    const target = allKeys.find(k => (k.toLowerCase().includes('price') || k.toLowerCase().includes('value')) && k !== 'PredictedValue') || allKeys[0];

    const formatted = result.data.map((row, i) => ({
      index: i + 1,
      actual: parseFloat(row[target]),
      predicted: parseFloat(row.PredictedValue),
      ...row // Keep original data for tooltips
    }));

    return { chartData: formatted, columns: allKeys, targetKey: target };
  }, [result]);

  return (
    <div className='min-h-screen bg-slate-50 p-6 lg:p-12 font-sans text-slate-900'>
      {/* Header */}
      <header className='max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
          <h1 className='text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2'>
            <Activity className="text-blue-600" /> Regression Analytics
          </h1>
          <p className='text-slate-500 mt-1'>Upload dataset to generate predictive insights and model metrics.</p>
        </div>

        <form onSubmit={submitHandler} className='flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200'>
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files[0])}
            className='text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer'
          />
          <button 
            type="submit" 
            disabled={loading}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${loading ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200'}`}
          >
            {loading ? 'Processing...' : 'Analyze Data'}
          </button>
        </form>
      </header>

      {result && (
        <main className='max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700'>
          
          {/* Top Row: Key Performance Indicators */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <MetricCard title="Total Observations" value={result.totalRows} icon={<LayoutGrid size={20}/>} color="text-slate-700" />
            <MetricCard title="Target Variable" value={targetKey} icon={<TrendingUp size={20}/>} color="text-blue-600" />
            <MetricCard title="Status" value="Success" icon={<Activity size={20}/>} color="text-emerald-600" />
            <div className='bg-blue-600 p-5 rounded-2xl shadow-md text-white'>
                <p className='text-blue-100 text-xs font-semibold uppercase tracking-wider'>System Message</p>
                <p className='text-sm mt-1 font-medium leading-tight'>{result.message}</p>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            
            {/* Primary Chart: Actual vs Predicted Area Chart */}
            <div className='lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200'>
              <div className='flex justify-between items-center mb-6'>
                <h3 className='font-bold text-slate-800 italic'>Model Performance: Actual vs Predicted</h3>
                <span className='text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-500'>TIME SERIES VIEW</span>
              </div>
              <div className='h-[350px]'>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="index" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="top" align="right" iconType="circle" />
                    <Area type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" name="Actual Value" />
                    <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} name="Prediction" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Side Chart: Error Distribution or Comparison */}
            <div className='bg-white p-6 rounded-2xl shadow-sm border border-slate-200'>
              <h3 className='font-bold text-slate-800 mb-6'>Variance Analysis</h3>
              <div className='h-[350px]'>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(0, 10)}>
                    <XAxis dataKey="index" hide />
                    <YAxis hide />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="actual" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Actual" />
                    <Bar dataKey="predicted" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Predicted" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className='text-xs text-center text-slate-400 mt-4'>Comparing first 10 samples for variance inspection</p>
            </div>
          </div>

          {/* Data Table Preview */}
          <div className='bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden'>
            <div className='p-6 border-b border-slate-100 flex justify-between items-center'>
                <h3 className='font-bold text-slate-800'>Dataset Preview & Predictions</h3>
                <FileText size={18} className="text-slate-400" />
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-sm'>
                <thead>
                  <tr className='bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest'>
                    {columns.map(col => <th key={col} className='px-6 py-4 font-semibold'>{col}</th>)}
                    <th className='px-6 py-4 font-semibold text-blue-600'>Predicted</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {result.data.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className='hover:bg-blue-50/30 transition-colors'>
                      {columns.map(col => (
                        <td key={col} className='px-6 py-4 text-slate-600'>{row[col]}</td>
                      ))}
                      <td className='px-6 py-4 font-bold text-blue-600'>{parseFloat(row.PredictedValue).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className='p-4 bg-slate-50 text-center'>
                <p className='text-xs text-slate-400'>Showing top 5 of {result.totalRows} rows</p>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

// Sub-component for clean UI
const MetricCard = ({ title, value, icon, color }) => (
  <div className='bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between'>
    <div>
      <p className='text-slate-500 text-xs font-bold uppercase tracking-wider mb-1'>{title}</p>
      <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
    </div>
    <div className='p-2 bg-slate-50 rounded-lg text-slate-400'>
      {icon}
    </div>
  </div>
);

export default Upload;