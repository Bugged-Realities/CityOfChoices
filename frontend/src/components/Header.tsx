import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getToken, logout } from "../api/auth";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoggedIn = !!getToken();
  const isOnGamePage = location.pathname === "/game";

  // Toggle hamburger menu
  const toggleMenu = () => setMenuOpen((open) => !open);

  // Close menu on navigation (for accessibility)
  const handleNav = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-title">City Of Choices</div>
      <nav className="header-nav" aria-label="Main navigation">
        <button onClick={() => handleNav("/")}>Home</button>
        {isLoggedIn && !isOnGamePage && (
          <button onClick={() => handleNav("/game")}>Back to Game</button>
        )}
        {isLoggedIn ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <button onClick={() => handleNav("/login")}>Login</button>
            <button onClick={() => handleNav("/register")}>Sign-up</button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
