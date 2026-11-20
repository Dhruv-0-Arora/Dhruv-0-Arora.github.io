/**
 * Development-only fixed camera, for inspecting one spot of the world at
 * any zoom: `?cam=x,y,z&at=x,y,z&fov=20`. Parsed once; the rig pins the
 * camera there and skips rails and driving. Never active in production.
 */

export interface DevCamera {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

function vec3(raw: string | null): [number, number, number] | null {
  if (!raw) return null;
  const parts = raw.split(",").map((s) => Number.parseFloat(s));
  if (parts.length !== 3 || !parts.every(Number.isFinite)) return null;
  return [parts[0], parts[1], parts[2]];
}

export function parseDevCamera(search: string): DevCamera | null {
  const params = new URLSearchParams(search);
  const position = vec3(params.get("cam"));
  if (!position) return null;
  const target = vec3(params.get("at")) ?? [0, 0, 0];
  const fov = Number.parseFloat(params.get("fov") ?? "");
  return {
    position,
    target,
    fov: Number.isFinite(fov) && fov > 0 && fov < 180 ? fov : 50,
  };
}
