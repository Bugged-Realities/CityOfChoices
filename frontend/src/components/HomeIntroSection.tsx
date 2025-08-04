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
      <section className="pt-20 px-4 max-w-4xl mx-auto text-left text-[#E8E6E3] min-h-[80vh]">
        <div className="bg-[#1A1F2C] rounded-lg border border-[#5ec3b8] p-8">
          <h2 className="text-[#E05219] font-['Press_Start_2P'] text-2xl font-bold mb-6 text-center">
            Discover the City of Choices
          </h2>
          <p className="text-lg leading-relaxed mb-8 text-center">
            Step into a pixel-art NYC subway where every choice leads to new
            adventures. Meet quirky characters, uncover secrets, and shape your
            own story. Will you find your way out, or embrace the mysteries
            below?
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                tabIndex={0}
                className="aspect-square p-6 bg-[#0A0F1C] rounded-lg border border-[#5ec3b8] hover:border-[#E05219] transition-colors flex flex-col items-center justify-center text-center shadow-lg"
              >
                <span aria-hidden="true" className="text-3xl mb-3">
                  {feature.icon}
                </span>
                <div className="space-y-2">
                  <div className="text-[#E05219] font-['Press_Start_2P'] font-bold text-sm">
                    {feature.title}
                  </div>
                  <div className="text-[#8B8A91] text-sm leading-tight">
                    {feature.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 max-w-4xl mx-auto pt-0 pb-12 text-[#E8E6E3]">
        <div className="bg-[#1A1F2C] rounded-lg border border-[#5ec3b8] p-8">
          <h2 className="text-[#E05219] font-['Press_Start_2P'] text-2xl font-bold mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((step, idx) => (
              <div
                tabIndex={0}
                key={idx}
                className="aspect-square p-4 bg-[#0A0F1C] rounded-lg border border-[#5ec3b8] hover:border-[#5ec3b8] transition-colors flex flex-col items-center justify-center text-center"
              >
                <span aria-hidden="true" className="text-2xl mb-2">
                  {step.icon}
                </span>
                <div className="space-y-1">
                  <div className="text-[#E05219] font-['Press_Start_2P'] font-bold text-xs">
                    {step.title}
                  </div>
                  <div className="text-[#8B8A91] text-xs leading-tight">
                    {step.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeIntroSection;
