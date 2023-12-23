import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import UnoCSS from "unocss/astro";
import vue from "@astrojs/vue";
import { remarkReadingTime } from "./plugins/readtime.mjs";
import { remarkModifiedTime } from "./plugins/modifiedtime.mjs";
import { remarkDeruntify } from "./plugins/deruntify.mjs";
import astroExpressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  vite: {
    build: {
      rollupOptions: {
        external: ["/pagefind/pagefind.js"],
      },
    },
  },
  markdown: {
    remarkPlugins: [remarkReadingTime, remarkModifiedTime, remarkDeruntify],
  },
  integrations: [
    astroExpressiveCode({
      themes: ["one-dark-pro"],
    }),
    mdx(),
    sitemap(),
    UnoCSS({
      injectReset: true,
    }),
    vue(),
  ],
});
