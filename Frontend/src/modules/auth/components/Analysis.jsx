import React, { useState, useEffect } from 'react';
import { Upload, Database, Brain, ChartBar, Sparkles, Zap, Target, ChevronRight } from 'lucide-react';
import FileUpload from './FileUpload';
import ColumnSelector from './ColumnSelector';
import EncodingSelector from './EncodingSelector';
import AlgorithmSelector from './AlgorithmSelector';
import ChartSelector from './ChartSelector';
import Results from './Results';
import api from '../../../../api';

function Analysis() {
  const [step, setStep] = useState(1);
  const [fileData, setFileData] = useState(null);
  const [targetColumn, setTargetColumn] = useState('');
  const [encodings, setEncodings] = useState({});
  const [algorithm, setAlgorithm] = useState('');
  const [selectedCharts, setSelectedCharts] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [encodedFilePath, setEncodedFilePath] = useState('');

  const steps = [
    { number: 1, title: 'Upload', icon: Upload, color: 'bg-rose-500' },
    { number: 2, title: 'Target', icon: Target, color: 'bg-emerald-500' },
    { number: 3, title: 'Encoding', icon: Database, color: 'bg-sky-500' },
    { number: 4, title: 'Model', icon: Brain, color: 'bg-indigo-500' },
    { number: 5, title: 'Visualize', icon: ChartBar, color: 'bg-amber-500' },
    { number: 6, title: 'Results', icon: Sparkles, color: 'bg-purple-500' }
  ];

  const handleFileUpload = (data) => {
    setFileData(data);
    setStep(2);
  };

  const handleTargetSelect = (column) => {
    setTargetColumn(column);
    setStep(3);
  };

  const handleEncodingsSubmit = async (selectedEncodings) => {
    setEncodings(selectedEncodings);
    setLoading(true);
    try {
      const response = await api.post('/analysis/encode', {
        filePath: fileData.filePath,
        columnEncodings: selectedEncodings
      });
      setEncodedFilePath(response.data.encodedFilePath);
      setStep(4);
    } catch (error) {
      alert('Failed to apply encodings');
    } finally {
      setLoading(false);
    }
  };

  const handleAlgorithmSelect = (selectedAlgo) => {
    setAlgorithm(selectedAlgo);
    setStep(5);
  };

  const handleChartsSelect = (charts) => {
    setSelectedCharts(charts);
    setStep(6);
  };

  const handleTrainModel = async () => {
    setLoading(true);
    try {
      const response = await api.post('/analysis/train', {
        EncodedFilePath: encodedFilePath,
        TargetColumn: targetColumn,
        Algorithm: algorithm,
        Parameters: {},
      });
      setResults(response.data);
    } catch (error) {
      alert('Failed to train model');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 6 && !results) {
      handleTrainModel();
    }
  }, [step]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-indigo-100 antialiased overflow-x-hidden relative">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />

      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <header className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm mb-4">
            <Zap size={14} className="text-indigo-600 fill-indigo-600" />
            <span className="text-xs font-bold tracking-widest uppercase text-slate-500">v3.0 Analysis Engine</span>
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-slate-900">
            ML Analysis <span className="text-indigo-600">Studio</span>
          </h1>
          <p className="text-slate-500 text-lg font-light max-w-xl mx-auto">
            A refined workspace to transform raw datasets into high-performance intelligence.
          </p>
        </header>

        {/* Stepper Navigation */}
        <nav className="mb-12">
          <div className="flex items-center justify-between max-w-4xl mx-auto relative">
            {/* Background Line */}
            <div className="absolute top-5 left-0 w-full h-[2px] bg-slate-100 -z-0" />
            
            {steps.map((s, index) => (
              <div key={s.number} className="relative z-10 flex flex-col items-center group">
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                    step >= s.number 
                    ? `${s.color} text-white shadow-lg shadow-${s.color.split('-')[1]}-200 scale-110` 
                    : 'bg-white border border-slate-200 text-slate-400'
                  }`}
                >
                  <s.icon size={18} strokeWidth={2.5} />
                </div>
                <span className={`absolute -bottom-7 text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap transition-colors duration-300 ${
                  step === s.number ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </nav>

        {/* Content Area */}
        <main className="relative mt-20 min-h-[500px]">
          {loading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-[2.5rem] transition-all duration-500">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Sparkles className="text-indigo-600 animate-pulse" size={48} />
                  <div className="absolute inset-0 text-indigo-400 blur-lg animate-ping">
                    <Sparkles size={48} />
                  </div>
                </div>
                <p className="font-medium text-slate-600 animate-pulse tracking-tight">Optimizing your workflow...</p>
              </div>
            </div>
          )}

          <div className="transition-all duration-700 ease-out transform">
            {step === 1 && <FileUpload onUpload={handleFileUpload} />}
            {step === 2 && fileData && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <ColumnSelector 
                  columns={fileData.columns} 
                  onSelect={handleTargetSelect}
                  onBack={() => setStep(1)}
                />
              </div>
            )}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <EncodingSelector 
                  columns={fileData.columns.filter(col => col.name !== targetColumn)}
                  onSubmit={handleEncodingsSubmit}
                  onBack={() => setStep(2)}
                />
              </div>
            )}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <AlgorithmSelector 
                  onSelect={handleAlgorithmSelect}
                  onBack={() => setStep(3)}
                />
              </div>
            )}
            {step === 5 && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <ChartSelector 
                  onSelect={handleChartsSelect}
                  onBack={() => setStep(4)}
                />
              </div>
            )}
            {step === 6 && results && (
              <div className="animate-in fade-in zoom-in-95 duration-1000">
                <Results 
                  results={results}
                  selectedCharts={selectedCharts}
                  targetColumn={targetColumn}
                  onRestart={() => {
                    setStep(1);
                    setFileData(null);
                    setResults(null);
                  }}
                />
              </div>
            )}
          </div>
        </main>

        {/* Subtle Footer */}
        <footer className="mt-24 text-center border-t border-slate-200 pt-8">
          <p className="text-slate-400 text-sm font-medium">
            Designed for high-performance data science. © 2026 Analysis Studio.
          </p>
        </footer>
      </div>

      {/* Subtle Floating Shapes for Depth */}
      <div className="fixed top-[20%] -left-20 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob -z-20" />
      <div className="fixed top-[40%] -right-20 w-64 h-64 bg-rose-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 -z-20" />
    </div>
  );
}

export default Analysis;