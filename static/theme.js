(() => {
  const b = document.querySelector(".theme");
  if (!b) return;
  const r = document.documentElement;
  const modes = ["auto", "light", "dark"];
  let m = r.dataset.theme || "auto";
  const show = () => {
    if (m == "auto") delete r.dataset.theme;
    else r.dataset.theme = m;
    b.textContent = "theme: " + m;
  };
  b.onclick = () => {
    m = modes[(modes.indexOf(m) + 1) % 3];
    try {
      m == "auto" ? localStorage.removeItem("theme") : localStorage.setItem("theme", m);
    } catch {}
    show();
  };
  addEventListener("pageshow", (e) => {
    if (!e.persisted || /[?&]theme=/.test(location.search)) return;
    try {
      m = localStorage.getItem("theme");
    } catch {}
    if (!modes.includes(m)) m = "auto";
    show();
  });
  show();
  b.hidden = false;
})();
