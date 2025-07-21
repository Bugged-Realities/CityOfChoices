import React from "react";

const steps = [
  {
    icon: "📝",
    title: "Sign Up or Log In",
    desc: "Create your account or log in to start your adventure.",
  },
  {
    icon: "👤",
    title: "Meet Your Character",
    desc: "Get to know your character and prepare for the journey.",
  },
  {
    icon: "🎮",
    title: "Choose Your Path",
    desc: "Make choices, explore, and shape your story in the City of Choices.",
  },
  {
    icon: "💾",
    title: "Progress is Saved",
    desc: "Your progress is auto-saved—return anytime to continue!",
  },
];

const HowItWorksSection: React.FC = () => {
  return (
    <section className="howitworks-section">
      <h2 className="howitworks-title">How It Works</h2>
      <div className="howitworks-steps">
        {steps.map((step, idx) => (
          <div className="howitworks-step" tabIndex={0} key={idx}>
            <span className="howitworks-icon" aria-hidden="true">
              {step.icon}
            </span>
            <div className="howitworks-step-content">
              <div className="howitworks-step-title">{step.title}</div>
              <div className="howitworks-step-desc">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
