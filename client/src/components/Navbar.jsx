import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

function Navbar({ toggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="premium-navbar">
      <div className="navbar-left">
        <button
          type="button"
          className={`navbar-menu-btn ${isSidebarOpen ? "active" : ""}`}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <span className="menu-line" />
          <span className="menu-line" />
          <span className="menu-line" />
        </button>

        <div className="navbar-brand">
          <div className="navbar-brand-badge">💸</div>
          <div className="navbar-brand-text">
            <h2>Smart Expense Tracker</h2>
            <p>Secure personal finance dashboard</p>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-user-chip">
          <span className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </span>
          <div className="user-meta">
            <strong>{user?.name || "User"}</strong>
            <small>{user?.email || "No email"}</small>
          </div>
        </div>

        <button type="button" className="navbar-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;