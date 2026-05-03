import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useExamStore } from "../../store/examStore";

export default function Navbar({ showTimer, timerDisplay }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const user = useExamStore((s) => s.user);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="bg-jamb-blue text-white px-6 py-3 flex items-center
                       justify-between shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
          <span className="text-jamb-blue font-bold text-lg">J</span>
        </div>
        <span className="font-bold text-lg tracking-wide hidden sm:block">
          JAMB CBT Practice
        </span>
      </div>

      {showTimer && (
        <div className={`font-mono text-xl font-bold px-4 py-1 rounded-lg
          ${timerDisplay <= 300
            ? "bg-red-600 animate-pulse"
            : "bg-white text-jamb-blue"}`}>
          ⏱ {timerDisplay}
        </div>
      )}

      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-blue-200 hidden sm:block">
            {user.email?.split("@")[0].toUpperCase()}
          </span>
        )}
        <button
          onClick={handleLogout}
          className="text-sm bg-white text-jamb-blue px-3 py-1 rounded-lg
                     font-semibold hover:bg-blue-100 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
