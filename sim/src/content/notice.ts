export interface Notice {
  title: string;
  body: string;
  plainSite: { label: string; href: string };
  enterAnyway: string;
}

export const notice: Notice = {
  title: "The simulator won't run here.",
  body: "It needs WebGL, a wider screen, and motion turned on.",
  plainSite: { label: "Go to the plain site", href: "/" },
  enterAnyway: "Enter anyway (no camera glides)",
};
