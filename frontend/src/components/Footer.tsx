import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      {/* About */}
      <div className="footer-left">
        <span className="game-name">Bugged Realities: City of Choices</span>{" "}
        &copy; {"2025"} <br />
        <span className="footer-tagline">A surreal NYC subway adventure.</span>
      </div>
      {/* Links */}
      <div className="footer-right">
        <div className="footer-links">
          <a className="footer-link" href="#about">
            About
          </a>
          <a
            className="footer-link"
            href="https://github.com/your-github"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
        <span className="footer-version">v1.0.0</span>
      </div>
    </footer>
  );
};

export default Footer;
