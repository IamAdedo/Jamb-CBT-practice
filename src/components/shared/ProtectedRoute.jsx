import { Navigate } from "react-router-dom";
import { useExamStore } from "../../store/examStore";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const user = useExamStore((s) => s.user);

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && user.role !== "admin")
    return <Navigate to="/" replace />;

  return children;
}
