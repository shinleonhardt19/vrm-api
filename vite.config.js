import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 7420,
    allowedHosts: ["leonhardtlab47.io.vn"],
  },
});
