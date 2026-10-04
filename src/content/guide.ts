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
  title: "How to ride the range",
  intro:
    "This portfolio is a mountain range. Every summit, shoulder and lakeshore holds a real project, and a little railway climbs from the valley to each of them and back. The vehicle on the pad is a real robot CAD file parsed live in the browser, and the biplane above it is a 1903 Flyer at full size.",
  steps: [
    {
      keys: ["scroll"],
      text: "Ride the railway round the range, site by site, and back down to the hub.",
    },
    {
      keys: ["drag"],
      text: "Click and drag the world to look around; let go and it coasts.",
    },
    { keys: ["F"], text: "Take the wheel of the Dozer." },
    {
      keys: ["W", "A", "S", "D"],
      text: "Drive. The arrow keys work too. Every trail is climbable; the cliffs are not.",
    },
    {
      keys: ["T"],
      text: "Take off in the Flyer hanging over the pad. W and S for throttle, A and D to bank, the up and down arrows to climb and dive.",
    },
    {
      keys: ["Esc"],
      text: "Let go of the wheel, or land, and glide back to the train.",
    },
  ],
  outro:
    "Each site opens this panel with the project you are next to. The photos above the pad are from the Cascades, and the range borrows its peaks: astute sits on the summit of Adams, Synthesis on the shoulder of Rainier. Mount Adams is climbed; Rainier is next. The range runs in daylight or at night to match the hour on your clock.",
};
