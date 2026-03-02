import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify";

export default defineConfig({
  output: "hybrid",
  adapter: netlify(),
  site: 'https://luna-araujo.com',
  base: '/',
  image: {
    service: {
      entrypoint: 'astro/assets/services/squoosh',
    },
  },
  integrations: [tailwind()]
});
