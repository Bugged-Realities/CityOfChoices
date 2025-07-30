import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#0A0F1C] text-[#E8E6E3] px-6 py-3 flex justify-between items-center text-sm z-40 shadow-inner border-t border-[#61B044] font-['Press_Start_2P']">
      {/* About */}
      <div>
        <span className="font-bold text-[#E05219]">
          Bugged Realities: City of Choices
        </span>{" "}
        &copy; 2025 <br />
        <span className="text-xs text-[#8B8A91]">
          A surreal NYC subway adventure.
        </span>
      </div>
      {/* Links */}
      <div className="text-right space-y-1">
        <div className="space-x-4">
          <a
            href="#about"
            className="hover:underline hover:text-[#61B044] transition-colors"
          >
            About
          </a>
          <a
            href="https://github.com/your-github"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-[#61B044] transition-colors"
          >
            GitHub
          </a>
        </div>
        <span className="text-xs text-[#8B8A91]">v1.0.0</span>
      </div>
    </footer>
  );
};

export default Footer;
