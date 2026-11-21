const pre = document.querySelector(".glyph pre");
const link = pre?.closest("a");

async function start() {
  const [{ instance }, data] = await Promise.all([
    WebAssembly.instantiateStreaming(fetch(pre.dataset.wasm)),
    fetch(pre.dataset.asset).then((r) => {
      if (!r.ok) throw r.status;
      return r.arrayBuffer();
    }),
  ]);
  const x = instance.exports;
  const bytes = new Uint8Array(data);
  if (bytes.length > x.asset_cap()) return;
  new Uint8Array(x.memory.buffer, x.asset_ptr(), bytes.length).set(bytes);
  if (x.load(bytes.length)) return;

  const decoder = new TextDecoder();
  const draw = (m) => {
    const n = x.render(...m);
    if (n) pre.innerHTML = decoder.decode(new Uint8Array(x.memory.buffer, x.output_ptr(), n));
  };
  const first = new Float32Array(data.slice(22, 58));
  draw(first);

  const still = matchMedia("(prefers-reduced-motion: reduce)");
  let yaw = Math.atan2(first[2], first[0]);
  const [sp, cp] = [first[7], first[4]];
  let shown = yaw;
  let spin = 0;
  let drag = null;
  let moved = false;
  let visible = true;
  let frame = 0;
  let last = 0;

  const tick = (t) => {
    frame = 0;
    const dt = Math.min(t - last, 100);
    if (dt < 30) return wake();
    last = t;
    if (!drag) {
      yaw += spin * dt;
      spin *= 0.85 ** (dt / 33);
      if (Math.abs(spin) < 3e-5) spin = 0;
      if (!still.matches && !spin) yaw += dt * 1.5e-4;
    }
    if (yaw !== shown) {
      shown = yaw;
      const [sy, cy] = [Math.sin(yaw), Math.cos(yaw)];
      draw([cy, 0, sy, sp * sy, cp, -sp * cy, -cp * sy, sp, cp * cy]);
    }
    wake();
  };
  const wake = () => {
    const busy = drag || spin || !still.matches;
    if (!frame && visible && !document.hidden && busy) frame = requestAnimationFrame(tick);
  };

  link.style.touchAction = "pan-y";
  link.addEventListener("pointerdown", (e) => {
    if (e.button) return;
    drag = { from: e.clientX, x: e.clientX, t: e.timeStamp };
    moved = false;
    spin = 0;
    try {
      link.setPointerCapture(e.pointerId);
    } catch {}
    wake();
  });
  link.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(e.clientX - drag.from) > 3) moved = true;
    yaw += dx * 0.02;
    spin = (dx * 0.02) / Math.max(e.timeStamp - drag.t, 8);
    drag = { from: drag.from, x: e.clientX, t: e.timeStamp };
  });
  const release = (e) => {
    if (drag && e.timeStamp - drag.t > 60) spin = 0;
    drag = null;
    wake();
  };
  link.addEventListener("pointerup", release);
  link.addEventListener("pointercancel", release);
  link.addEventListener("click", (e) => {
    if (moved && e.detail) e.preventDefault();
    moved = false;
  });
  link.addEventListener("dragstart", (e) => e.preventDefault());
  new IntersectionObserver((entries) => {
    visible = entries.at(-1).isIntersecting;
    wake();
  }).observe(pre);
  document.addEventListener("visibilitychange", wake);
  still.addEventListener("change", wake);
  wake();
}

if (pre && link && window.WebAssembly) {
  (window.requestIdleCallback || setTimeout)(() => start().catch(() => {}));
}
