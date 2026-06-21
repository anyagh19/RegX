import React, { useState, useMemo } from 'react';
import api from '../../../../api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from 'recharts';
import {
  LayoutGrid, TrendingUp, Activity, FileText, UploadCloud, CheckCircle2, AlertTriangle
} from 'lucide-react';

function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setErrorMsg('');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a CSV file to analyze.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('File', file);

    try {
      const response = await api.post('/Regression/train', formData);
      setResult(response.data);
    } catch (error) {
      console.error('Training failed', error);
      setErrorMsg('Training failed. Please check if your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Process chart data and metadata
  const { chartData, columns, targetKey } = useMemo(() => {
    if (!result || !result.data || result.data.length === 0)
      return { chartData: [], columns: [], targetKey: '' };

    const firstRow = result.data[0];
    const allKeys = Object.keys(firstRow);
    const target =
      allKeys.find(
        (k) =>
          (k.toLowerCase().includes('price') || k.toLowerCase().includes('value')) &&
          k !== 'PredictedValue'
      ) || allKeys[0];

    const formatted = result.data.map((row, i) => ({
      index: i + 1,
      actual: parseFloat(row[target]),
      predicted: parseFloat(row.PredictedValue),
      ...row,
    }));

    return { chartData: formatted, columns: allKeys, targetKey: target };
  }, [result]);

  return (
    <div className="min-h-screen bg-[#0B1120] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto p-6 lg:p-10 relative z-10">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <Activity className="text-blue-400" />
              Dataset Analysis
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-lg">
              Upload your CSV file to train a regression model and explore predictions.
            </p>
          </div>

          <form
            onSubmit={submitHandler}
            className="flex items-center gap-3 bg-[#0F172A] p-2 rounded-2xl border border-slate-800 shadow-lg shadow-black/10"
          >
            {/* File input with icon */}
            <label
              className={`flex items-center gap-3 text-sm cursor-pointer transition-all ${
                dragActive ? 'bg-blue-500/10 border-blue-500/30' : 'border-slate-700'
              } border rounded-xl px-4 py-2.5 text-slate-300 hover:border-blue-500/30`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <UploadCloud size={18} className="text-slate-500" />
              <span className="hidden sm:inline truncate max-w-[120px]">
                {file ? file.name : 'Choose file'}
              </span>
              <span className="sm:hidden text-xs">File</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={loading || !file}
              className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                loading
                  ? 'bg-slate-800 text-slate-500 cursor-wait'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {loading ? 'Training...' : 'Analyze Data'}
            </button>
          </form>
        </header>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> {errorMsg}
          </div>
        )}

        {/* Results section */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Rows"
                value={result.totalRows}
                icon={<LayoutGrid size={20} />}
                color="text-white"
                bgIcon="bg-slate-800"
              />
              <MetricCard
                title="Target Variable"
                value={targetKey}
                icon={<TrendingUp size={20} />}
                color="text-blue-400"
                bgIcon="bg-blue-500/20"
              />
              <MetricCard
                title="Status"
                value="Success"
                icon={<CheckCircle2 size={20} />}
                color="text-emerald-400"
                bgIcon="bg-emerald-500/20"
              />
              <div className="bg-blue-600/10 border border-blue-500/20 p-5 rounded-2xl flex flex-col justify-center">
                <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
                  System Message
                </p>
                <p className="text-sm text-slate-300 leading-tight line-clamp-2">{result.message}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Area Chart */}
              <div className="lg:col-span-2 bg-[#0F172A] backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white">Actual vs Predicted</h3>
                  <span className="text-[10px] font-bold bg-slate-800 px-3 py-1 rounded-full text-slate-400 uppercase tracking-wider">
                    Time Series View
                  </span>
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="index" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          border: '1px solid #1e293b',
                          borderRadius: '12px',
                          color: '#f1f5f9',
                        }}
                      />
                      <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ color: '#94a3b8' }} />
                      <Area
                        type="monotone"
                        dataKey="actual"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorActual)"
                        name="Actual Value"
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#f59e0b' }}
                        name="Predicted"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Side Bar Chart */}
              <div className="bg-[#0F172A] backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="font-bold text-white mb-6">Variance Inspection</h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.slice(0, 10)}>
                      <XAxis dataKey="index" hide />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: '#1e293b' }}
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          border: '1px solid #1e293b',
                          borderRadius: '12px',
                          color: '#f1f5f9',
                        }}
                      />
                      <Bar dataKey="actual" fill="#334155" radius={[4, 4, 0, 0]} name="Actual" />
                      <Bar dataKey="predicted" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Predicted" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-center text-slate-500 mt-4">First 10 samples comparison</p>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-[#0F172A] backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-white">Predictions Preview</h3>
                <FileText size={18} className="text-slate-500" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-800">
                      {columns.map((col) => (
                        <th key={col} className="px-6 py-4 font-semibold">
                          {col}
                        </th>
                      ))}
                      <th className="px-6 py-4 font-semibold text-blue-400">Predicted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {result.data.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        {columns.map((col) => (
                          <td key={col} className="px-6 py-4 text-slate-300">
                            {row[col]}
                          </td>
                        ))}
                        <td className="px-6 py-4 font-bold text-blue-400">
                          {parseFloat(row.PredictedValue).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 bg-slate-900/50 text-center border-t border-slate-800">
                  <p className="text-xs text-slate-500">
                    Showing top 5 of {result.totalRows} rows
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for metric cards
const MetricCard = ({ title, value, icon, color, bgIcon }) => (
  <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-lg flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
    </div>
    <div className={`p-2 rounded-lg ${bgIcon} text-slate-400`}>{icon}</div>
  </div>
);

export default Upload;