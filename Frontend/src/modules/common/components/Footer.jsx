import React from 'react'

function Footer() {
  return (
    <footer class="bg-white border-t border-slate-200 pt-12 pb-8 px-6">
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
      <div class="col-span-1 md:col-span-1">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-[10px] text-white">R</div>
          <span class="font-bold text-slate-900">RegressAI</span>
        </div>
        <p class="text-slate-500 text-sm leading-relaxed">
          High-performance regression analysis and predictive modeling tools for data scientists.
        </p>
      </div>

      <div>
        <h4 class="font-bold text-slate-900 mb-4 uppercase text-xs tracking-widest">Algorithms</h4>
        <ul class="space-y-2 text-sm text-slate-600">
          <li><a href="#" class="hover:text-indigo-600">Linear Regression</a></li>
          <li><a href="#" class="hover:text-indigo-600">Polynomial Fit</a></li>
          <li><a href="#" class="hover:text-indigo-600">Random Forest</a></li>
          <li><a href="#" class="hover:text-indigo-600">Ridge & Lasso</a></li>
        </ul>
      </div>

      <div>
        <h4 class="font-bold text-slate-900 mb-4 uppercase text-xs tracking-widest">Resources</h4>
        <ul class="space-y-2 text-sm text-slate-600">
          <li><a href="#" class="hover:text-indigo-600">API Docs</a></li>
          <li><a href="#" class="hover:text-indigo-600">Sample Data</a></li>
          <li><a href="#" class="hover:text-indigo-600">Community</a></li>
        </ul>
      </div>

      <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <p class="text-[10px] font-mono text-slate-400 mb-2 uppercase">Core Equation</p>
        <p class="text-sm font-mono text-slate-700 italic">$y = \beta_0 + \beta_1x_1 + \epsilon$</p>
      </div>
    </div>

    <div class="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
      <p>© 2026 RegressAI Engine. All rights reserved.</p>
      <div class="flex gap-6">
        <a href="#" class="hover:underline">Privacy Policy</a>
        <a href="#" class="hover:underline">Terms of Service</a>
        <a href="#" class="hover:underline">Status</a>
      </div>
    </div>
  </div>
</footer>
  )
}

export default Footer