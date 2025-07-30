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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0F1C] text-[#E8E6E3] shadow-md font-['Press_Start_2P'] px-6 py-3 flex justify-between items-center border-b border-[#61B044]">
      <div className="text-[#E05219] font-bold">City Of Choices</div>
      <nav aria-label="Main navigation" className="space-x-4">
        <button
          onClick={() => handleNav("/")}
          className="hover:text-[#61B044] transition-colors"
        >
          Home
        </button>
        {isLoggedIn && !isOnGamePage && (
          <button
            onClick={() => handleNav("/game")}
            className="hover:text-[#61B044] transition-colors"
          >
            Back to Game
          </button>
        )}
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="hover:text-[#61B044] transition-colors"
          >
            Logout
          </button>
        ) : (
          <>
            <button
              onClick={() => handleNav("/login")}
              className="hover:text-[#61B044] transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => handleNav("/register")}
              className="hover:text-[#61B044] transition-colors"
            >
              Sign-up
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
