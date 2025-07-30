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

const HomeIntroSection: React.FC = () => {
  return (
    <>
      {/* Game Overview Section */}
      <section className="pt-20 px-4 max-w-4xl mx-auto text-left space-y-12 bg-[#0A0F1C] text-[#E8E6E3] min-h-screen">
        <div className="space-y-8">
          <h2 className="text-[#E05219] font-['Press_Start_2P'] text-2xl font-bold mb-6">
            Welcome to the City of Choices
          </h2>
          <p className="text-lg leading-relaxed mb-8">
            Board the wrong NYC subway train and find yourself trapped in a
            surreal, pixel-art world. Navigate strange tunnels, meet bizarre
            characters, and make choices that shape your fate. Will you escape,
            or become part of the underground?
          </p>
          <ul className="space-y-6">
            {features.map((f, i) => (
              <li
                key={i}
                tabIndex={0}
                className="flex items-start space-x-4 p-4 bg-[#1A1F2C] rounded-lg border border-[#61B044] hover:border-[#E05219] transition-colors"
              >
                <span role="img" aria-label={f.title} className="text-2xl">
                  {f.icon}
                </span>
                <div className="flex-1">
                  <span className="block text-[#E05219] font-['Press_Start_2P'] font-bold text-sm mb-2">
                    {f.title}
                  </span>
                  <span className="block text-[#8B8A91] text-sm leading-relaxed">
                    {f.desc}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 max-w-4xl mx-auto py-12 bg-[#0A0F1C] text-[#E8E6E3]">
        <h2 className="text-[#E05219] font-['Press_Start_2P'] text-2xl font-bold mb-8 text-center">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              tabIndex={0}
              key={idx}
              className="flex flex-col items-center text-center p-6 bg-[#1A1F2C] rounded-lg border border-[#61B044] hover:border-[#E05219] transition-colors"
            >
              <span aria-hidden="true" className="text-3xl mb-4">
                {step.icon}
              </span>
              <div className="space-y-2">
                <div className="text-[#E05219] font-['Press_Start_2P'] font-bold text-sm">
                  {step.title}
                </div>
                <div className="text-[#8B8A91] text-xs leading-relaxed">
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default HomeIntroSection;
