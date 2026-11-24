import { createReadStream, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const STATIC = resolve(import.meta.dirname, "../static");
const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

// The Rust site owns /photos and /resume; in dev, serve its static/ at the root.
function rootStatic(): Plugin {
  return {
    name: "root-static",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = decodeURIComponent((req.url ?? "").split("?")[0]);
        const file = resolve(STATIC, `.${path}`);
        if (
          !file.startsWith(STATIC + sep) ||
          !statSync(file, { throwIfNoEntry: false })?.isFile()
        ) {
          return next();
        }
        const type = TYPES[extname(file)];
        if (type) res.setHeader("Content-Type", type);
        createReadStream(file).pipe(res);
      });
    },
  };
}

export default defineConfig({
  base: "/sim/",
  plugins: [react(), tailwindcss(), rootStatic()],
  build: {
    outDir: resolve(import.meta.dirname, "../dist/sim"),
    emptyOutDir: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // React first: a group also takes the dependencies of what it
            // captures, so without this react-dom and scheduler would ride
            // in with @react-three/fiber and drag three onto every page.
            {
              name: "react",
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 20,
            },
            {
              name: "three",
              test: /node_modules[\\/](three|@react-three[\\/].*|protobufjs|pako)[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});
