import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      // The simulator at /, and a plain photo page at /gallery/ that never
      // loads three.js.
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        gallery: resolve(import.meta.dirname, "gallery/index.html"),
      },
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
