import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { useEffect, useState } from "react";

export default function ProtectedRoute() {
  const { checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    async function verify() {
      const res = await checkAuth();
      setIsAuth(res.isAuthenticated);
      setLoading(false);
    }
    verify();
  }, []);

  if (loading) return <div className="text-center mt-10">Checking authentication...</div>;
  if (!isAuth) return <Navigate to="/login" />;

  return <Outlet />;
}
