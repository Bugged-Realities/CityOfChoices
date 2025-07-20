import React from "react";

const Footer: React.FC = () => {
  return (
    <footer>
      {/* About */}
      <div>
        <span>Bugged Realities: City of Choices</span> &copy; {"2025"} <br />
        <span>A surreal NYC subway adventure.</span>
      </div>
      {/* Links */}
      <div>
        <a href="#about">About</a>
        <a
          href="https://github.com/your-github"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <span>v1.0.0</span>
      </div>
    </footer>
  );
};

export default Footer;
