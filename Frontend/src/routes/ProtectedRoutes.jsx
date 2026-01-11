import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function ProtectedRoutes({ children }) {
  const accessToken = useSelector(state => state.auth.accessToken);
  console.log("ProtectedRoutes - accessToken:", accessToken);

  if (accessToken === undefined) {
    return <div>Checking session...</div>;
  }


  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

export default ProtectedRoutes;
