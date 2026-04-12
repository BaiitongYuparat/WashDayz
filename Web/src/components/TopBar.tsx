import { useNavigate } from "react-router-dom";

function TopBar() {
  const navigate = useNavigate();
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-end gap-4 px-8 py-4 border-b border-gray-200 bg-white">
      {user && (
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-base font-semibold">
            {getInitials(user.name)}
          </div>
          <div>
            <p className="text-base font-semibold text-gray-800 leading-none">{user.name}</p>
            <p className="text-sm text-gray-400 mt-1">{user.role}</p>
          </div>
        </div>
      )}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 text-base text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-100 transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Logout
      </button>
    </div>
  );
}

export default TopBar;