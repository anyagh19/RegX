import React, { useState } from 'react';
import { Upload, Play, BarChart3, FileText, Settings, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isTraining, setIsTraining] = useState(false);

  // Mock data for UI representation
  const stats = [
    { label: 'R-Squared Score', value: '0.92', icon: <BarChart3 className="text-blue-500" /> },
    { label: 'Mean Absolute Error', value: '12.4', icon: <FileText className="text-purple-500" /> },
    { label: 'Training Time', value: '4.2s', icon: <Settings className="text-orange-500" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ML.NET Regression Studio</h1>
          <p className="text-gray-500 text-sm">Upload data and predict continuous values automatically.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
          <Upload size={18} /> Upload New CSV
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar - Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Settings size={18} /> Model Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Target Column</label>
                <select className="w-full mt-1 p-2 border rounded-md bg-gray-50">
                  <option>Price</option>
                  <option>Sales_Volume</option>
                  <option>Temperature</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Algorithm</label>
                <select className="w-full mt-1 p-2 border rounded-md bg-gray-50">
                  <option>FastTree Regression</option>
                  <option>Stochastic Dual Coordinate Ascent</option>
                  <option>LightGBM</option>
                </select>
              </div>
              <button 
                onClick={() => setIsTraining(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium flex justify-center items-center gap-2"
              >
                {isTraining ? "Training..." : <><Play size={16} /> Train Model</>}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">{stat.icon}</div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Visualization Placeholder */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-75">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Actual vs. Predicted</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Model Ready</span>
            </div>
            
            {/* Visual representation of a chart */}
            <div className="w-full h-64 bg-gray-50 rounded-lg border-dashed border-2 border-gray-200 flex flex-col items-center justify-center text-gray-400">
               <BarChart3 size={48} className="mb-2 opacity-20" />
               <p>Chart Visualization (Plotly or Chart.js)</p>
            </div>
          </div>

          {/* Data Preview Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold">Dataset Preview (Top 5 Rows)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Feature_A</th>
                    <th className="px-6 py-3">Feature_B</th>
                    <th className="px-6 py-3 font-bold text-blue-600">Target (Price)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[1, 2, 3, 4, 5].map((row) => (
                    <tr key={row} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">#00{row}</td>
                      <td className="px-6 py-4">0.452</td>
                      <td className="px-6 py-4">1.229</td>
                      <td className="px-6 py-4 font-semibold">$240.00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;