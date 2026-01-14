import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PublicRoutes = ({ children }) => {
  const accessToken = useSelector((state) => state.auth.accessToken);

  // routes = [
  //   '/signup',
  //   '/signin',
  //   '/'
  // ]

  

  if (accessToken) {
    // Already logged in → redirect to dashboard
    return <Navigate to="/user-home" replace />;
  }

  return children;
};

export default PublicRoutes;
