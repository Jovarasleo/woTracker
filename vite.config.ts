import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      // Precache the tab icons (both active and inactive) so they work offline.
      includeAssets: [
        "favicon.svg",
        "favicon-inactive.svg",
        "icons/apple-touch-icon.png",
      ],
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        // App files are already precached by hash. Only cache the external
        // exercise images at runtime; a catch-all rule here would also cache
        // index.html and old hashed chunks in a cache that is never cleaned up.
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin === "https://raw.githubusercontent.com",
            handler: "CacheFirst",
            options: {
              cacheName: "exercise-images",
              expiration: { maxEntries: 500 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: "Workout Tracker",
        short_name: "woTracker",
        description: "Simple workout tracking app",
        theme_color: "#1c7ed6",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: false,
    }),
    tailwindcss(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
});
