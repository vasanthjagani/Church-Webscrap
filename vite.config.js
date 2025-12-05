import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true, // Allow external connections
    allowedHosts: [
      "eternal-ppm-incl-stanley.trycloudflare.com",
      ".trycloudflare.com", // Allow all Cloudflare tunnel subdomains
      "localhost",
      "127.0.0.1",
    ],
  },
});
