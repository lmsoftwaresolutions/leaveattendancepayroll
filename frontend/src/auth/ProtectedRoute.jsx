import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, allowed }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" />;
  if (allowed && !allowed.includes(user.role))
    return <Navigate to="/" />;

  return children;
}
