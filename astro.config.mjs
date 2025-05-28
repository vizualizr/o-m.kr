// @ts-check
import { defineConfig } from "astro/config";
import basicSsl from '@vitejs/plugin-basic-ssl'; // HTTPS connection activated on 2025-05-26
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";


// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss(), basicSsl()],
    server: {
      https: true,  // reinforce ssl connection 
    },
  },
  integrations: [mdx()],
  server: {
    host: true,
  },
});
