addEventListener("keydown", (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  const shot = document.querySelector(".shot:target");
  const pick = { Escape: ".x", ArrowLeft: "[rel=prev]", ArrowRight: "[rel=next]" }[e.key];
  if (shot && pick) shot.querySelector(pick).click();
});
