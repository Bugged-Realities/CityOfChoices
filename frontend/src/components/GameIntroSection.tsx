import React from "react";

const features = [
  {
    icon: "🦎",
    title: "Surreal Subway World",
    desc: "Explore a pixelated NYC ruled by lizard people and a mysterious king.",
  },
  {
    icon: "🔀",
    title: "Branching Choices",
    desc: "Every decision changes your story and unlocks new secrets.",
  },
  {
    icon: "💾",
    title: "Save Progress",
    desc: "Jump back in anytime—your journey is always remembered.",
  },
  {
    icon: "🎮",
    title: "Replayable Adventures",
    desc: "Discover new endings and hidden paths with every playthrough.",
  },
];

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

const GameIntroSection: React.FC = () => {
  return (
    <>
      {/* Game Overview Section */}
      <section className="game-overview">
        <div>
          <h2 className="game-overview-title">
            Welcome to the City of Choices
          </h2>
          <p className="game-overview-desc">
            Board the wrong NYC subway train and find yourself trapped in a
            surreal, pixel-art world. Navigate strange tunnels, meet bizarre
            characters, and make choices that shape your fate. Will you escape,
            or become part of the underground?
          </p>
          <ul className="features-list">
            {features.map((f, i) => (
              <li className="feature-card" key={i} tabIndex={0}>
                <span className="feature-emoji" role="img" aria-label={f.title}>
                  {f.icon}
                </span>
                <div className="feature-text">
                  <span className="feature-title">{f.title}</span>
                  <span className="feature-desc">{f.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How It Works Section */}
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
    </>
  );
};

export default GameIntroSection;
