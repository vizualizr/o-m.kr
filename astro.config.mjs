// @ts-check
import { defineConfig } from "astro/config";
import basicSsl from "@vitejs/plugin-basic-ssl"; // HTTPS connection activated on 2025-05-26
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import rehypeCitation from "rehype-citation";

// 2026-01-29 keystatic and necessary library installed.
import react from '@astrojs/react'
import markdoc from '@astrojs/markdoc'
import keystatic from '@keystatic/astro'

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss(), basicSsl()],
    server: {
      https: true, // reinforce ssl connection
    },
  },
  integrations: [mdx(), react(), markdoc(), keystatic()],
  server: {
    host: true,
  },
  markdown: {
    rehypePlugins: [
      [
        rehypeCitation,
        {
          // this is a symlink via mklink. the source file is "D:\yonggeun\porter\zotero\references.bib"
          bibliography: "./src/assets/references.bib",
          csl: "https://raw.githubusercontent.com/citation-style-language/styles/refs/heads/master/chicago-notes-bibliography.csl",
          linkCitations: true,
          suppressBibliography: true,
        },
      ],
    ],
  },
});

// csl: "./src/assets/chicago-notes-bibliography.csl",
// The availability of external CSL file is required to be testified. If unavailable, use the value above.
// rehype-citation has no function to verify it.  
