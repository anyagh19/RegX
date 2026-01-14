import { useState , useEffect } from 'react'

import './App.css'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignUpPage from './pages/SignUpPage'
import SignInPage from './pages/SignInPage'
import UserHomePage from './pages/UserHomePage'
import ProtectedRoutes from './routes/ProtectedRoutes'
import { useDispatch } from 'react-redux'
import { addAccessToken, removeAccessToken } from './features/auth/authSlice'
import api from './../api'
import PublicRoutes from './routes/PublicRoutes'

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Attempt to refresh the token on mount
        // This works because the Refresh Token is in an HttpOnly cookie
        const { data } = await api.post("/User/refresh-tokens");
        
        // 2. If successful, update Redux
        dispatch(addAccessToken(data.accessToken));
      } catch (err) {
        console.log("No valid session found, redirecting to login...");
      } finally {
        // 3. Signal that the check is done
        setLoading(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // if (loading) {
  //   // Show a splash screen or spinner so the user doesn't see 
  //   // flickers of "Logged Out" states
  //   return <><h1>hi</h1></>; 
  // }

  return (
    <>
      <Routes>
        <Route path="/" element={<PublicRoutes><HomePage /></PublicRoutes>} />
        <Route path="/signup" element={<PublicRoutes><SignUpPage /></PublicRoutes>} />
        <Route path="/signin" element={<PublicRoutes><SignInPage /></PublicRoutes>} />
        <Route path="/user-home" element={<ProtectedRoutes><UserHomePage /></ProtectedRoutes>} />

      </Routes>
    </>
  )
}

export default App
