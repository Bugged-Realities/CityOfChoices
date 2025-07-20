import React from "react";

const steps = [
  {
    icon: "👤",
    title: "Create Your Character",
    desc: "Choose your look and background.",
  },
  {
    icon: "🗺️",
    title: "Explore & Choose",
    desc: "Navigate surreal subway tunnels and make decisions.",
  },
  {
    icon: "⚡",
    title: "Survive the Unexpected",
    desc: "Face strange events and challenges.",
  },
  {
    icon: "🔍",
    title: "Discover Endings",
    desc: "Unlock secrets and new storylines.",
  },
];

const HowItWorksSection: React.FC = () => {
  return (
    <section>
      <h2>How It Works</h2>
      <div>
        {steps.map((step, i) => (
          <div key={i}>
            <div>{step.icon}</div>
            <div>{step.title}</div>
            <div>{step.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
