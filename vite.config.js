import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "apple-touch-icon.png", "favicon-64.png"],
      manifest: {
        name: "The Cut — Health Tracker",
        short_name: "The Cut",
        description:
          "Daily discipline protocol — steps, protein, water, training and weight tracking.",
        theme_color: "#111217",
        background_color: "#111217",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      // makes the app installable while running `npm run dev` on localhost too
      devOptions: { enabled: true },
    }),
  ],
  server: { port: 5173, open: false },
});
