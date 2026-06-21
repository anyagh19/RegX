import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-[#0B1120] border-t border-slate-800/60 pt-10 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand & Description */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-xs">R</span>
              </div>
              <span className="font-bold text-white tracking-tight">
                Regress<span className="text-blue-400">AI</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              High‑performance regression analysis and predictive modeling for data scientists.
            </p>
          </div>

          {/* Minimal Link Groups */}
          <div className="col-span-2 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                Algorithms
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors">Linear Regression</Link></li>
                <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors">Random Forest</Link></li>
                <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors">Ridge & Lasso</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors">API Docs</Link></li>
                <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors">Sample Data</Link></li>
                <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors">Privacy</Link></li>
                <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors">Terms</Link></li>
                <li><Link to="#" className="text-slate-400 hover:text-blue-400 transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© 2026 RegressAI Engine. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-blue-400 transition-colors">System Status</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;