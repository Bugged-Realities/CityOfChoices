import React from "react";

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Preparing your journey...",
}) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0A0F1C] via-[#1A1F2C] to-[#0A0F1C]">
    <div className="bg-[#1A1F2C] border-2 border-[#5ec3b8] rounded-lg p-6 shadow-xl max-w-md">
      <h2 className="text-[#5ec3b8] font-['Press_Start_2P'] text-xl font-bold text-center mb-4">
        🔄 Loading...
      </h2>
      <p className="text-[#E8E6E3] font-['Press_Start_2P'] text-sm text-center">
        {message}
      </p>
    </div>
  </div>
);

export default LoadingSpinner;
