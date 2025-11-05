import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "My Events", path: "/dashboard" },
    { label: "Marketplace", path: "/marketplace" },
    { label: "Requests", path: "/requests" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link to="/dashboard" className="text-xl font-semibold text-blue-600">
            SlotSwapper
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`transition-colors ${
                    isActive
                      ? "text-blue-600"
                      : "hover:text-blue-500"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:block">
            {user ? `Hi, ${user.name.split(" ")[0]}` : ""}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
