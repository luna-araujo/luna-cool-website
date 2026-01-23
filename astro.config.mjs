import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: 'https://luna-araujo.github.io',
  base: '/luna-cool-website/',
  image: {
    service: {
      entrypoint: 'astro/assets/services/squoosh',
    },
  },
  integrations: [tailwind()]
});