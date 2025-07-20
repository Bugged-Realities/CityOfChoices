import React from "react";
import { useNavigate } from "react-router-dom";

const HeaderSection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className="header-section">
      <div className="header-content">
        <h1>
          <span>City of Choices</span>
        </h1>
        <p>One wrong train. One twisted world. Every choice counts.</p>
      </div>
      <div className="header-buttons">
        <button>Start Adventure</button>
        <button onClick={() => navigate("/login")}>Log In</button>
        <button onClick={() => navigate("/register")}>Register</button>
      </div>
    </section>
  );
};

export default HeaderSection;
