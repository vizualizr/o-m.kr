// @ts-check
import { defineConfig } from 'astro/config';
// tailwind config
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
      integrations: [tailwind(), mdx()],
      server: {
            host: true
          }
});
