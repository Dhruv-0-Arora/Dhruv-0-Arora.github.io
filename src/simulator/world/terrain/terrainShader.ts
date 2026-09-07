import * as THREE from "three";
import { TERRAIN } from "./terrainField.ts";
import { TRAIL_MAP } from "./trailMask.ts";

/**
 * The range's surface, painted per pixel. The authored mesh is one
 * `tok.rock` surface; this patch on its MeshStandardMaterial decides at
 * each fragment whether it is snow, glacier ice, bare rock, scree, meadow
 * or forest floor from height, slope, sun aspect and noise, then adds a
 * fine bump so rock reads as rock under the sun and the shadow maps.
 *
 * Everything derives from the palette: `diffuse` (rock, kept current by
 * the material registry) plus the snow, forest and meadow uniforms. The
 * trails and lake shores come from a polar mask texture (`trailMask.ts`)
 * that the range samples with the same mapping the mask was built with.
 */

export interface TerrainUniforms {
  uSnow: { value: THREE.Color };
  uForest: { value: THREE.Color };
  uMeadow: { value: THREE.Color };
  uSunDir: { value: THREE.Vector3 };
  uSnowRoughness: { value: number };
  uTrail: { value: THREE.Texture };
  /** (inner radius, outer radius, enabled) of the trail mask. */
  uTrailMap: { value: THREE.Vector3 };
}

function emptyMask(): THREE.DataTexture {
  const t = new THREE.DataTexture(new Uint8Array(4), 1, 1);
  t.needsUpdate = true;
  return t;
}

export function createTerrainUniforms(): TerrainUniforms {
  return {
    uSnow: { value: new THREE.Color(0.9, 0.92, 0.95) },
    uForest: { value: new THREE.Color(0.06, 0.15, 0.09) },
    uMeadow: { value: new THREE.Color(0.2, 0.3, 0.1) },
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uSnowRoughness: { value: 0.62 },
    uTrail: { value: emptyMask() },
    uTrailMap: {
      value: new THREE.Vector3(TRAIL_MAP.inner, TRAIL_MAP.outer, 0),
    },
  };
}

const f = (n: number) => n.toFixed(2);

/** Shared noise and the field, mirroring `terrainField.ts`. */
const common = /* glsl */ `
  uniform vec3 uSnow;
  uniform vec3 uForest;
  uniform vec3 uMeadow;
  uniform vec3 uSunDir;
  uniform float uSnowRoughness;
  uniform sampler2D uTrail;
  uniform vec3 uTrailMap;
  varying vec3 vTerrainPos;
  varying vec3 vTerrainNormal;

  float tSnow = 0.0;
  float tForest = 0.0;
  float tMeadow = 0.0;
  float tTreeline = 0.0;
  float tSnowline = 0.0;
  float tTrail = 0.0;
  float tShore = 0.0;
  float tTread = 0.0;

  // The mask's polar mapping: theta across (wrapping), rho down.
  vec2 trailUv(vec3 p) {
    return vec2(
      atan(p.z, p.x) / 6.28318530718 + 0.5,
      (length(p.xz) - uTrailMap.x) / (uTrailMap.y - uTrailMap.x)
    );
  }

  float thash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float tnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = thash(i);
    float b = thash(i + vec2(1.0, 0.0));
    float c = thash(i + vec2(0.0, 1.0));
    float d = thash(i + vec2(1.0, 1.0));
    return a + (b - a) * f.x + (c - a) * f.y + (a - b - c + d) * f.x * f.y;
  }

  float tfbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      v += amp * tnoise(p);
      p = p * 2.02 + vec2(17.3, 9.1);
      amp *= 0.5;
    }
    return v / 0.9375;
  }

  void terrainMasks(vec3 p, vec3 n) {
    vec2 q = p.xz;
    float y = p.y;
    vec2 trail = uTrailMap.z > 0.5 ? texture2D(uTrail, trailUv(p)).rg : vec2(0.0);
    tTrail = trail.r;
    tShore = trail.g;
    tTread = smoothstep(0.12, 0.7, tTrail);
    tTreeline = ${f(TERRAIN.treeline)} + ${f(TERRAIN.treelineWobble)} * (tfbm(q * ${f(TERRAIN.treelineScale)} + vec2(31.7, -12.3)) * 2.0 - 1.0);
    // Sunward faces melt out, so their snowline sits higher.
    float aspect = dot(n.xz, uSunDir.xz);
    tSnowline = ${f(TERRAIN.snowline)} + ${f(TERRAIN.snowlineWobble)} * (tfbm(q * ${f(TERRAIN.snowlineScale)} + vec2(-5.1, 8.7)) * 2.0 - 1.0) + ${f(TERRAIN.snowlineAspect)} * aspect;
    // The snow edge is crisp but ragged: a narrow step over a noisy height.
    float cover = smoothstep(tSnowline - 2.5, tSnowline + 2.5, y + 9.0 * (tfbm(q * 0.07) * 2.0 - 1.0));
    // Steep faces shed snow and show the rock of the cleavers; some rime
    // holds on even the steep ground near the summits.
    float hold = smoothstep(0.46, 0.64, n.y + 0.16 * (tfbm(q * 0.16 + 3.0) - 0.5));
    float high = smoothstep(tSnowline + 25.0, tSnowline + 60.0, y);
    tSnow = cover * mix(hold, 1.0, 0.35 * high);
    float gentle = smoothstep(0.42, 0.66, n.y);
    float below = 1.0 - smoothstep(tTreeline - 9.0, tTreeline + 3.0, y);
    float clumps = smoothstep(0.25, 0.65, tfbm(q * 0.045 + vec2(7.1, 3.3)));
    tForest = below * gentle * (0.35 + 0.65 * clumps) * (1.0 - tSnow) * (1.0 - tTread);
    tMeadow = smoothstep(tTreeline - 16.0, tTreeline - 4.0, y) * (1.0 - smoothstep(tTreeline + 4.0, tTreeline + 16.0, y)) * gentle * (1.0 - tSnow) * (1.0 - tTread);
  }

  vec3 terrainAlbedo(vec3 rock, vec3 p, vec3 n) {
    vec2 q = p.xz;
    float y = p.y;
    // Strata: bands along height, bent by a low warp, with iron staining
    // on the brighter bands.
    float warp = tfbm(q * 0.05) * 6.0;
    float strata = tfbm(vec2(y * 0.22 + warp, q.x * 0.015 + q.y * 0.01));
    float grain = tfbm(q * 0.9);
    // Runnels and scree chutes: noise stretched along the fall line.
    vec2 fall = n.xz / max(length(n.xz), 0.05);
    vec2 across = vec2(-fall.y, fall.x);
    float streak = tfbm(vec2(dot(q, across) * 0.3, dot(q, fall) * 0.07) + 43.0);
    vec3 col = rock * (0.80 + 0.30 * strata) * (0.90 + 0.20 * grain) * (0.9 + 0.2 * streak);
    col = mix(col, col * vec3(1.08, 0.99, 0.88), smoothstep(0.55, 0.8, strata) * 0.7);
    float cliff = 1.0 - smoothstep(0.35, 0.62, n.y);
    col *= 1.0 - 0.22 * cliff;
    // Scree fans: pale, on the moderate slopes above the trees.
    float scree = smoothstep(0.6, 0.85, n.y)
      * smoothstep(tTreeline - 4.0, tTreeline + 20.0, y)
      * (1.0 - smoothstep(tTreeline + 30.0, tTreeline + 70.0, y))
      * smoothstep(0.35, 0.7, tfbm(q * 0.08 + 11.0));
    col = mix(col, rock * vec3(1.16, 1.14, 1.08), scree * 0.55);
    vec3 forestCol = uForest * (0.82 + 0.36 * tfbm(q * 0.12 + 5.0));
    vec3 meadowCol = uMeadow * (0.88 + 0.24 * tfbm(q * 0.2 + 9.0));
    col = mix(col, meadowCol, tMeadow * (1.0 - tForest));
    col = mix(col, forestCol, tForest);
    // Trails: a beaten dirt tread, lighter and warmer than the rock, with
    // the margins trodden a little darker where boots leave the path.
    float margin = smoothstep(0.03, 0.2, tTrail) * (1.0 - smoothstep(0.2, 0.55, tTrail));
    vec3 dirt = rock * vec3(1.30, 1.22, 1.08) * (0.9 + 0.2 * grain) * (0.94 + 0.12 * streak);
    col = mix(col, dirt, tTread);
    col *= 1.0 - 0.12 * margin;
    // Lake shores: pale gravel just above the water.
    vec3 gravel = rock * vec3(1.20, 1.18, 1.12) * (0.92 + 0.16 * grain);
    col = mix(col, gravel, tShore * (1.0 - tTread) * 0.85);
    // Snow, with the glacier ice below the snowline reading blue.
    // Wind-packed snow is not one white: broad soft drifts, a fine grain.
    float drift = tfbm(q * 0.035 + 21.0);
    vec3 snowCol = uSnow * (0.88 + 0.12 * drift) * (0.96 + 0.04 * grain) * (0.95 + 0.07 * streak);
    float glacier = smoothstep(0.55, 0.85, n.y) * (1.0 - smoothstep(tSnowline + 8.0, tSnowline + 30.0, y));
    snowCol = mix(snowCol, snowCol * vec3(0.84, 0.92, 1.0), glacier * 0.7);
    return mix(col, snowCol, tSnow);
  }

  vec3 terrainNormal(vec3 p, vec3 n) {
    vec2 q = p.xz;
    float fine = 1.0 - smoothstep(300.0, 650.0, distance(p, cameraPosition));
    float e = 0.75;
    vec2 qx = q + vec2(e, 0.0);
    vec2 qz = q + vec2(0.0, e);
    float h0 = tfbm(q * 0.14) + fine * 0.6 * tfbm(q * 0.55);
    float hx = tfbm(qx * 0.14) + fine * 0.6 * tfbm(qx * 0.55);
    float hz = tfbm(qz * 0.14) + fine * 0.6 * tfbm(qz * 0.55);
    float amt = mix(4.5, 1.0, tSnow) * (1.0 - 0.6 * tForest) * (1.0 - 0.7 * tTread);
    return normalize(n - vec3(hx - h0, 0.0, hz - h0) * amt);
  }
`;

/**
 * Patches a registered rock material so the range paints itself. The
 * uniforms object is shared with the caller, which keeps it current.
 */
export function patchTerrainMaterial(
  material: THREE.MeshStandardMaterial,
  uniforms: TerrainUniforms,
): void {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        varying vec3 vTerrainPos;
        varying vec3 vTerrainNormal;`,
      )
      .replace(
        "#include <fog_vertex>",
        /* glsl */ `#include <fog_vertex>
        vTerrainPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vTerrainNormal = normalize(mat3(modelMatrix) * objectNormal);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${common}`)
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
        {
          vec3 tN = normalize(vTerrainNormal);
          terrainMasks(vTerrainPos, tN);
          diffuseColor.rgb = terrainAlbedo(diffuse, vTerrainPos, tN);
        }`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        /* glsl */ `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, uSnowRoughness, tSnow);`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        /* glsl */ `#include <normal_fragment_maps>
        {
          vec3 tN = terrainNormal(vTerrainPos, normalize(vTerrainNormal));
          normal = normalize((viewMatrix * vec4(tN, 0.0)).xyz);
        }`,
      );
  };
  material.customProgramCacheKey = () => "terrain";
  material.needsUpdate = true;
}
