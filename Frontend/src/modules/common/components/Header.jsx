import React from 'react'

function Header() {
    return (
        <nav class="bg-slate-900 border-b border-slate-800 px-6 py-4">
            <div class="max-w-7xl mx-auto flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold text-xl">Σ</span>
                    </div>
                    <span class="text-xl font-semibold text-white tracking-tight">Regress<span class="text-indigo-400">AI</span></span>
                </div>

                <div class="hidden md:flex items-center gap-8">
                    <a href="#" class="text-slate-300 hover:text-white transition-colors">Dashboard</a>
                    <a href="#" class="text-slate-300 hover:text-white transition-colors">Datasets</a>
                    <a href="#" class="text-slate-300 hover:text-white transition-colors">Model History</a>
                    <div class="h-6 w-px bg-slate-700"></div>
                    <div class="flex items-center gap-2 text-sm font-medium text-emerald-400">
                        <span class="relative flex h-2 w-2">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        System Ready
                    </div>
                </div>

                <div class="flex items-center gap-4">
                    <button class="hidden sm:block text-slate-300 hover:text-white font-medium">Documentation</button>
                    <button class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg shadow-indigo-500/20">
                        New Analysis
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Header