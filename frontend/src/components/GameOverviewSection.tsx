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

const GameOverviewSection: React.FC = () => {
  return (
    <section className="game-overview">
      <div>
        {/* Story description and features */}
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
      </div>
    </section>
  );
};

export default GameOverviewSection;
