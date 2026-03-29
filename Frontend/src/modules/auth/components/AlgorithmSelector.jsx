import React, { useState, useEffect } from 'react';
import { Brain, ArrowLeft, Cpu, Layers, Network, Check, ChevronRight } from 'lucide-react';
import api from '../../../../api';

function AlgorithmSelector({ onSelect, onBack }) {
    const [algorithms, setAlgorithms] = useState([]);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        fetchAlgorithms();
    }, []);

    const fetchAlgorithms = async () => {
        try {
            const response = await api.get('/analysis/algorithms');
            setAlgorithms(response.data);
        } catch (error) {
            console.error('Failed to fetch algorithms:', error);
        }
    };

    const categories = ['All', ...new Set(algorithms.map(a => a.category))];

    const filteredAlgorithms = selectedCategory === 'All'
        ? algorithms
        : algorithms.filter(a => a.category === selectedCategory);

    const getCategoryTheme = (category) => {
        const themes = {
            'Regression': { color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
            'Classification': { color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
            'Clustering': { color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
            'Time Series': { color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' }
        };
        return themes[category] || { color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' };
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'Regression': Cpu,
            'Classification': Layers,
            'Clustering': Network
        };
        return icons[category] || Brain;
    };

    return (
        <div className="max-w-5xl mx-auto antialiased pb-24">
            {/* Header */}
            <div className="text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold tracking-[0.2em] uppercase mx-auto">
                    <Brain size={12} />
                    Step 4: Intelligence
                </div>
                <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Choose Algorithm</h2>
                <p className="text-slate-500 max-w-lg mx-auto font-light text-lg">
                    Select the mathematical core that will power your predictive model.
                </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 border
                            ${selectedCategory === category 
                                ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800'}`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAlgorithms.map((algo) => {
                    const theme = getCategoryTheme(algo.category);
                    const Icon = getCategoryIcon(algo.category);
                    const isSelected = selectedAlgorithm === algo.name;

                    return (
                        <div
                            key={algo.name}
                            onClick={() => setSelectedAlgorithm(algo.name)}
                            className={`group relative cursor-pointer rounded-[2rem] p-8 border-2 transition-all duration-500 overflow-hidden
                                ${isSelected 
                                    ? `bg-white ${theme.border} shadow-2xl -translate-y-1` 
                                    : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl'
                                }`}
                        >
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`p-4 rounded-2xl ${theme.bg} ${theme.color}`}>
                                        <Icon size={24} strokeWidth={1.5} />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${theme.color} ${theme.border}`}>
                                        {algo.category}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                                    {algo.displayName}
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                    {algo.description}
                                </p>
                            </div>

                            {/* Apple-style Selection Overlay */}
                            {isSelected && (
                                <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-${theme.color.split('-')[1]}-50/30 animate-in fade-in duration-500`}>
                                    <div className={`absolute bottom-6 right-6 w-8 h-8 rounded-full ${theme.color.replace('text', 'bg')} text-white flex items-center justify-center shadow-lg animate-in zoom-in duration-300`}>
                                        <Check size={18} strokeWidth={3} />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredAlgorithms.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                    <Brain size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-medium">No algorithms found in this category</p>
                </div>
            )}

            {/* Floating Navigation */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-50">
                <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2rem] p-3 flex items-center justify-between gap-4">
                    <button 
                        onClick={onBack}
                        className="flex items-center gap-2 px-6 py-3 text-slate-500 font-semibold hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </button>

                    <button 
                        onClick={() => selectedAlgorithm && onSelect(selectedAlgorithm)}
                        disabled={!selectedAlgorithm}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 px-8 rounded-2xl font-bold transition-all duration-500
                            ${selectedAlgorithm 
                                ? 'bg-black text-white hover:bg-slate-800 shadow-xl active:scale-95' 
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                    >
                        <span>Confirm Algorithm</span>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AlgorithmSelector;