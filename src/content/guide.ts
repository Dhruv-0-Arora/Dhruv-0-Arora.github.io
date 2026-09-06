/** Copy for the how-to panel shown at the hub. Keys are rendered as keycaps. */
export interface GuideStep {
  keys: string[];
  text: string;
}

export interface Guide {
  kicker: string;
  title: string;
  intro: string;
  steps: GuideStep[];
  outro: string;
}

export const guide: Guide = {
  kicker: "the simulator",
  title: "How to explore",
  intro:
    "This portfolio is a world. Every installation is a real project, and the vehicle on the pad is a real robot CAD file parsed live in the browser.",
  steps: [
    { keys: ["scroll"], text: "Travel the rail through the four districts." },
    {
      keys: ["drag"],
      text: "Click and drag the world to look around; let go and it coasts.",
    },
    { keys: ["F"], text: "Take the wheel of the Dozer." },
    { keys: ["W", "A", "S", "D"], text: "Drive. The arrow keys work too." },
    { keys: ["Esc"], text: "Let go of the wheel and glide back to the rail." },
    {
      keys: ["theme"],
      text: "The toggle in the corner switches between the day sim and the night sim.",
    },
  ],
  outro:
    "Each district opens this panel with the project you are next to. The photos above the pad are from the Cascades. Mount Adams is climbed; Rainier is next.",
};
