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
    title: "Auto-Save Progress",
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
    <section>
      <div>
        {/* Story description and features */}
        <div>
          <h2>Welcome to Bugged Realities</h2>
          <p>
            Board the wrong NYC subway train and find yourself trapped in a
            surreal, pixel-art world. Navigate strange tunnels, meet bizarre
            characters, and make choices that shape your fate. Will you escape,
            or become part of the underground?
          </p>
          <ul>
            {features.map((f, i) => (
              <li key={i}>
                <span role="img" aria-label={f.title}>
                  {f.icon}
                </span>
                <div>
                  <span>{f.title}</span>
                  <span>{f.desc}</span>
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
