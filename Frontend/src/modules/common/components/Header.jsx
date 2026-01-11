import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../../../api'
import { removeAccessToken } from '../../../features/auth/authSlice';

function Header() {
    const isAuthorized = useSelector(state => !!state.auth.accessToken)
    console.log("Header - isAuthorized:", isAuthorized)

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutHandler = async () => {
        // 1️⃣ Clear frontend state immediately
        dispatch(removeAccessToken());
        navigate("/signin");

        // 2️⃣ Best-effort backend logout
        try {
            await api.post("/User/logout");
        } catch (error) {
            console.log("Backend logout failed (ignored)", error);
        }
    };

    return (
        <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">Σ</span>
                    </div>
                    <span className="text-xl font-semibold text-white tracking-tight">Regress<span className="text-indigo-400">AI</span></span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <a href="#" className="text-slate-300 hover:text-white transition-colors">Dashboard</a>
                    <a href="#" className="text-slate-300 hover:text-white transition-colors">Datasets</a>
                    <a href="#" className="text-slate-300 hover:text-white transition-colors">Model History</a>
                    <div className="h-6 w-px bg-slate-700"></div>
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        System Ready
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="hidden sm:block text-slate-300 hover:text-white font-medium">Documentation</button>
                    {isAuthorized ?
                        (<button
                            onClick={logoutHandler}
                            className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg shadow-red-500/20"
                        >
                            Log Out
                        </button>
                        ) : (
                            <>
                                <Link to="/signin">
                                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg shadow-indigo-500/20">
                                        Sign In
                                    </button>
                                </Link>

                                <Link to="/signup">
                                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg shadow-indigo-500/20">
                                        Sign Up
                                    </button>
                                </Link>
                            </>
                        )}
                </div>
            </div>
        </nav>
    )
}

export default Header