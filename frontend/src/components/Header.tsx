import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Toggle hamburger menu
  const toggleMenu = () => setMenuOpen((open) => !open);

  // Close menu on navigation (for accessibility)
  const handleNav = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-title">City Of Choices</div>
      <nav className="header-nav" aria-label="Main navigation">
        <button onClick={() => handleNav("/")}>Home</button>
        <button onClick={() => handleNav("/login")}>Login</button>
        <button onClick={() => handleNav("/register")}>Sign-up</button>
      </nav>
    </header>
  );
};

export default Header;
