import { useState, useEffect } from "react";
import { REFRESH_TOKEN } from '../../constants';
import { JwtDecode } from 'jsonwebtoken'

function ProtectedRoutes({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => { 
        auth().catch(setIsAuthenticated(false));
    }, []);

    const refreshToken = async () => {
        try {
            const refresh = localStorage.getItem(REFRESH_TOKEN);
            const res = await api.post('/User/refresh-token', { refreshToken: refresh })
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.accessToken);
                localStorage.setItem(REFRESH_TOKEN, res.data.refreshToken);
                setIsAuthenticated(true);
            }
            else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Error refreshing token:", error);
            setIsAuthenticated(false);
        }
    }

    const auth = async () => {
        try {
            const token = localStorage.getItem(ACCESS_TOKEN);
            if (!token) {
                setIsAuthenticated(false);
                return;
            }
            const decoded = JwtDecode(token);
            console.log('de', decoded)
            const currentTime = Date.now() / 1000;
            if (decoded.exp < currentTime) {
                await refreshToken();
            }
            else {
                setIsAuthenticated(false)
            }
        } catch (error) {
            console.log(error)
        }
    }

    if (isAuthenticated == null) {
        return <div>Loading...</div>
    }

    return isAuthorized ? children : <Navigate to='/login' />
}

export default ProtectedRoutes;