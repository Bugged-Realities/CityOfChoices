import React, { useState, useEffect } from "react";

type StageId = string;
type BackgroundTheme =
  | "subway_tunnel"
  | "subway_car"
  | "underground_city"
  | "depths";
type Mood =
  | "mysterious"
  | "dangerous"
  | "vibrant"
  | "claustrophobic"
  | "surreal";

const STAGE_BACKGROUND_MAP: Record<StageId, BackgroundTheme> = {
  // Starting scenes
  start_subway: "subway_tunnel",
  start_city: "underground_city",
  start_depths: "depths", // Now using the depths background

  // Subway scenes
  subway_sleeping: "subway_car",
  conductor_meeting: "subway_car",
  wall_encounter: "subway_car",
  deep_journey: "subway_car",

  // City scenes
  lizard_observation: "underground_city",
  crystal_exploration: "underground_city",
  human_search: "underground_city",
  crystal_city_entrance: "underground_city",

  // Depths scenes - now using the depths background
  thought_trail: "depths",
  reality_search: "depths",
  chaos_acceptance: "depths",

  // Vision/Ending scenes
  scale_visions: "underground_city",
  rift_creation: "depths", // This could be depths since it's reality-warping
  ending_lost_forever: "depths", // Lost in the depths
  ending_homebound: "subway_car",
};

const BACKGROUND_THEMES: Record<
  BackgroundTheme,
  { image: string; mood: Mood; transition: string }
> = {
  subway_tunnel: {
    image:
      "/images/Flux_Dev_Create_a_layered_pixel_art_parallax_background_inspir_0.jpg",
    mood: "mysterious",
    transition: "fade",
  },

  subway_car: {
    image: "/images/pixel_art_Pixel_art_of_a_New_Y.jpeg",
    mood: "claustrophobic",
    transition: "slide-left",
  },

  underground_city: {
    image: "/images/pixel_art_Pixel_art_background.jpeg",
    mood: "vibrant",
    transition: "fade",
  },

  depths: {
    image: "/images/pixel_art_Create_a_pixel_art_b.jpeg",
    mood: "surreal",
    transition: "fade",
  },
};

interface BackgroundProps {
  stageId: string;
}

const getMoodFilter = (mood: Mood): string => {
  const filters: Record<Mood, string> = {
    mysterious: "brightness(0.8) contrast(1.2)",
    dangerous: "brightness(0.6) contrast(1.5) saturate(1.2)",
    vibrant: "brightness(1.1) saturate(1.3)",
    claustrophobic: "brightness(0.7) contrast(1.3)",
    surreal: "brightness(1.0) saturate(1.4) contrast(1.1)", // For depths scenes
  };
  return filters[mood];
};

const Background: React.FC<BackgroundProps> = ({ stageId }) => {
  const [currentTheme, setCurrentTheme] =
    useState<BackgroundTheme>("subway_tunnel");
  const [nextTheme, setNextTheme] = useState<BackgroundTheme | null>(null);
  const [showNext, setShowNext] = useState(false);

  const backgroundTheme =
    STAGE_BACKGROUND_MAP[stageId as StageId] || "subway_tunnel";
  const currentThemeData = BACKGROUND_THEMES[currentTheme];
  const nextThemeData = nextTheme ? BACKGROUND_THEMES[nextTheme] : null;

  // Handle theme changes
  useEffect(() => {
    if (backgroundTheme !== currentTheme) {
      setNextTheme(backgroundTheme);
      setShowNext(true);

      // After the fade transition completes, update the current theme
      const timer = setTimeout(() => {
        setCurrentTheme(backgroundTheme);
        setNextTheme(null);
        setShowNext(false);
      }, 600); // Match the CSS transition duration

      return () => clearTimeout(timer);
    }
  }, [backgroundTheme, currentTheme]);

  // Initialize theme on first load
  useEffect(() => {
    if (
      currentTheme === "subway_tunnel" &&
      backgroundTheme !== "subway_tunnel"
    ) {
      setCurrentTheme(backgroundTheme);
    }
  }, [backgroundTheme, currentTheme]);
  return (
    <div className="background-container">
      {/* Current background layer */}
      <div
        className={`background-layer ${showNext ? "fade-out" : ""}`}
        style={{
          backgroundImage: `url(${currentThemeData.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: getMoodFilter(currentThemeData.mood),
        }}
      />

      {/* Next background layer for smooth transition */}
      <div
        className={`background-layer ${showNext ? "fade-in" : ""}`}
        style={{
          backgroundImage: `url(${
            nextThemeData?.image || currentThemeData.image
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: getMoodFilter(nextThemeData?.mood || currentThemeData.mood),
          opacity: nextThemeData && showNext ? 1 : 0,
        }}
      />
    </div>
  );
};

export default Background;
