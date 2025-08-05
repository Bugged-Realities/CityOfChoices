import React, { useState, useEffect, useRef } from "react";
import "../../App.css";

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

// This map defines which background theme to use for each stage of the game.
const STAGE_BACKGROUND_MAP: Record<StageId, BackgroundTheme> = {
  // Starting scenes
  start_subway: "subway_tunnel",
  start_city: "underground_city",
  start_depths: "depths",

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

  // Depths scenes
  thought_trail: "depths",
  reality_search: "depths",
  chaos_acceptance: "depths",

  // Vision/Ending scenes
  scale_visions: "underground_city",
  rift_creation: "depths",
  ending_lost_forever: "depths",
  ending_homebound: "subway_car",
};

// This map contains the specific details for each background theme.
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

// A helper function to apply a CSS filter based on the theme's mood.
const getMoodFilter = (mood: Mood): string => {
  const filters: Record<Mood, string> = {
    mysterious: "brightness(0.8) contrast(1.2)",
    dangerous: "brightness(0.6) contrast(1.5) saturate(1.2)",
    vibrant: "brightness(1.1) saturate(1.3)",
    claustrophobic: "brightness(0.7) contrast(1.3)",
    surreal: "brightness(1.0) saturate(1.4) contrast(1.1)",
  };
  return filters[mood];
};

const Background: React.FC<BackgroundProps> = ({ stageId }) => {
  // Determine the theme that *should* be displayed based on the current stageId prop.
  const targetTheme = STAGE_BACKGROUND_MAP[stageId] || "subway_tunnel";

  // `currentTheme` holds the theme that is currently displayed.
  const [currentTheme, setCurrentTheme] =
    useState<BackgroundTheme>(targetTheme);
  // A ref to track the previous stageId to reliably detect changes.
  const prevStageIdRef = useRef<StageId>(stageId);

  useEffect(() => {
    // Update theme immediately when stageId changes
    if (prevStageIdRef.current !== stageId) {
      console.log(
        `Stage changed: ${prevStageIdRef.current} -> ${stageId}. Updating theme.`
      );

      // Update the current theme immediately
      setCurrentTheme(targetTheme);
      prevStageIdRef.current = stageId;
    }
  }, [stageId, targetTheme]);

  const currentThemeData = BACKGROUND_THEMES[currentTheme];

  return (
    <div className="background-container">
      {/* Debug indicator */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "5px",
          fontSize: "12px",
          borderRadius: "4px",
        }}
      >
        Stage: {stageId} | Theme: {currentTheme}
        <button
          onClick={() => {
            const themes = Object.keys(BACKGROUND_THEMES) as BackgroundTheme[];
            const nextTestTheme =
              themes[(themes.indexOf(currentTheme) + 1) % themes.length];
            // This is a mock change for testing; in the real app, the parent would change the stageId prop.
            // To properly test, you'd need to simulate the parent changing the stageId.
            console.log("Manual test: switching to", nextTestTheme);
            setCurrentTheme(nextTestTheme);
          }}
          style={{ marginLeft: "10px", padding: "2px 5px", fontSize: "10px" }}
        >
          Test Theme Change
        </button>
      </div>

      {/* Background layer */}
      <div
        className="background-layer"
        style={{
          backgroundImage: `url(${currentThemeData.image})`,
          filter: getMoodFilter(currentThemeData.mood),
        }}
        onError={(e) =>
          console.error(
            "Failed to load background image:",
            currentThemeData.image
          )
        }
      />
    </div>
  );
};

export default Background;
