import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "child1",
      filename: "remoteEntry.js",
      exposes: {
        "./App": "./src/App",
      },
      shared: {
        react: { singleton: true, requiredVersion: "^19.1.1" },
        "react-dom": { singleton: true, requiredVersion: "^19.1.1" },
        "@mantine/core": { singleton: true, requiredVersion: "^8.3.5" },
        "@mantine/hooks": { singleton: true, requiredVersion: "^8.3.5" },
      },
    }),
  ],
  resolve: {
    dedupe: ["react", "react-dom", "@mantine/core", "@mantine/hooks"],
  },
  server: {
    port: 3002,
  },
});
