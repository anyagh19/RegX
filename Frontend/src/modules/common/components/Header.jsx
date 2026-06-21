import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeAccessToken } from '../../../features/auth/authSlice';
import api from '../../../../api';
import { ArrowRight, LogOut } from 'lucide-react';

function Header() {
  const isAuthorized = useSelector(state => !!state.auth.accessToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    dispatch(removeAccessToken());
    navigate('/signin');
    try {
      await api.post('/User/logout');
    } catch (error) {
      console.log('Backend logout failed (ignored)', error);
    }
  };

  return (
    <nav className="bg-[#0B1120] border-b border-slate-800/60 backdrop-blur-sm px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-lg">Σ</span>
          </div>
          <span className="text-xl font-semibold text-white tracking-tight">
            Regress<span className="text-blue-400">AI</span>
          </span>
        </Link>

        {/* Center Navigation – visible only when logged in */}
        {isAuthorized && (
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/analysis"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Analysis
            </Link>
            <Link
              to="/upload"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Datasets
            </Link>
          </div>
        )}

        {/* Right side – Auth / Logout */}
        <div className="flex items-center gap-4">
          {isAuthorized ? (
            <button
              onClick={logoutHandler}
              className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors group"
            >
              <LogOut size={16} className="group-hover:text-red-400" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          ) : (
            <>
              <Link
                to="/signin"
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
              >
                Get Started
                <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;