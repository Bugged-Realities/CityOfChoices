import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getToken, logout } from "../api/auth";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = !!getToken();
  const isOnGamePage = location.pathname === "/game";

  // Close menu on navigation (for accessibility)
  const handleNav = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0F1C] text-[#E8E6E3] shadow-md font-['Press_Start_2P'] px-6 py-3 flex justify-between items-center border-b border-[#5ec3b8]">
      <h1 className="text-[#E05219] text-2xl font-bold">City Of Choices</h1>
      <nav aria-label="Main navigation" className="space-x-8">
        <button
          onClick={() => handleNav("/")}
          className="relative overflow-hidden hover:text-[#5ec3b8] transition-colors group px-3 py-1"
        >
          <span className="relative z-10">Home</span>
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#1A1F2C] transition-all duration-500 ease-out">
            <div className="absolute top-0 left-0 w-0 h-0.5 bg-[#1A1F2C] transition-all duration-300 ease-out group-hover:w-full"></div>
            <div className="absolute top-0 right-0 w-0.5 h-0 bg-[#1A1F2C] transition-all duration-300 ease-out delay-75 group-hover:h-full"></div>
            <div className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#1A1F2C] transition-all duration-300 ease-out delay-150 group-hover:w-full"></div>
            <div className="absolute bottom-0 left-0 w-0.5 h-0 bg-[#1A1F2C] transition-all duration-300 ease-out delay-225 group-hover:h-full"></div>
          </div>
        </button>
        {isLoggedIn && !isOnGamePage && (
          <button
            onClick={() => handleNav("/game")}
            className="relative overflow-hidden hover:text-[#5ec3b8] transition-colors group px-3 py-1"
          >
            <span className="relative z-10">Back to Game</span>
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#1A1F2C] transition-all duration-500 ease-out">
              <div className="absolute top-0 left-0 w-0 h-0.5 bg-[#1A1F2C] transition-all duration-300 ease-out group-hover:w-full"></div>
              <div className="absolute top-0 right-0 w-0.5 h-0 bg-[#1A1F2C] transition-all duration-300 ease-out delay-75 group-hover:h-full"></div>
              <div className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#1A1F2C] transition-all duration-300 ease-out delay-150 group-hover:w-full"></div>
              <div className="absolute bottom-0 left-0 w-0.5 h-0 bg-[#1A1F2C] transition-all duration-300 ease-out delay-225 group-hover:h-full"></div>
            </div>
          </button>
        )}
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="relative overflow-hidden hover:text-[#5ec3b8] transition-colors group px-3 py-1"
          >
            <span className="relative z-10">Logout</span>
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#1A1F2C] transition-all duration-500 ease-out">
              <div className="absolute top-0 left-0 w-0 h-0.5 bg-[#1A1F2C] transition-all duration-300 ease-out group-hover:w-full"></div>
              <div className="absolute top-0 right-0 w-0.5 h-0 bg-[#1A1F2C] transition-all duration-300 ease-out delay-75 group-hover:h-full"></div>
              <div className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#1A1F2C] transition-all duration-300 ease-out delay-150 group-hover:w-full"></div>
              <div className="absolute bottom-0 left-0 w-0.5 h-0 bg-[#1A1F2C] transition-all duration-300 ease-out delay-225 group-hover:h-full"></div>
            </div>
          </button>
        ) : (
          <>
            <button
              onClick={() => handleNav("/login")}
              className="relative overflow-hidden hover:text-[#5ec3b8] transition-colors group px-3 py-1"
            >
              <span className="relative z-10">Login</span>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#1A1F2C] transition-all duration-500 ease-out">
                <div className="absolute top-0 left-0 w-0 h-0.5 bg-[#1A1F2C] transition-all duration-300 ease-out group-hover:w-full"></div>
                <div className="absolute top-0 right-0 w-0.5 h-0 bg-[#1A1F2C] transition-all duration-300 ease-out delay-75 group-hover:h-full"></div>
                <div className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#1A1F2C] transition-all duration-300 ease-out delay-150 group-hover:w-full"></div>
                <div className="absolute bottom-0 left-0 w-0.5 h-0 bg-[#1A1F2C] transition-all duration-300 ease-out delay-225 group-hover:h-full"></div>
              </div>
            </button>
            <button
              onClick={() => handleNav("/register")}
              className="relative overflow-hidden hover:text-[#5ec3b8] transition-colors group px-3 py-1"
            >
              <span className="relative z-10">Sign-up</span>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#1A1F2C] transition-all duration-500 ease-out">
                <div className="absolute top-0 left-0 w-0 h-0.5 bg-[#1A1F2C] transition-all duration-300 ease-out group-hover:w-full"></div>
                <div className="absolute top-0 right-0 w-0.5 h-0 bg-[#1A1F2C] transition-all duration-300 ease-out delay-75 group-hover:h-full"></div>
                <div className="absolute bottom-0 right-0 w-0 h-0.5 bg-[#1A1F2C] transition-all duration-300 ease-out delay-150 group-hover:w-full"></div>
                <div className="absolute bottom-0 left-0 w-0.5 h-0 bg-[#1A1F2C] transition-all duration-300 ease-out delay-225 group-hover:h-full"></div>
              </div>
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
