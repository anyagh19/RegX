import React from 'react'

function Home() {
  return (
    <section class="bg-slate-900 py-20 px-6">
  <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    <div>
      <h1 class="text-5xl font-extrabold text-white leading-tight mb-6">
        Predict the future with <span class="text-indigo-400 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Statistical Precision.</span>
      </h1>
      <p class="text-slate-400 text-lg mb-8 max-w-lg">
        Upload your datasets, identify correlations, and deploy high-accuracy regression models in seconds. No complex coding required.
      </p>
      <div class="flex flex-wrap gap-4">
        <button class="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2">
          Get Started — Free
        </button>
        <button class="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg font-bold border border-slate-700 transition-all">
          View Demo
        </button>
      </div>
    </div>
    
    <div class="relative">
      <div class="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-25"></div>
      <div class="relative bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-2xl">
         
         <div class="mt-4 flex justify-between items-center text-xs font-mono text-slate-400">
            <span>R² Score: 0.982</span>
            <span>MSE: 0.041</span>
         </div>
      </div>
    </div>
  </div>
</section>
  )
}

export default Home