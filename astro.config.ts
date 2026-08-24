import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const site = process.env.SITE_URL ?? "https://faadroneoperator.com";
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  site,
  base,
  srcDir: "./web",
  publicDir: "./public",
  outDir: "./site-dist",
  output: "static",
  trailingSlash: "always",
  vite: { plugins: [tailwindcss()] },
});
