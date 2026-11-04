import { defineConfig } from 'astro/config';

// SITE_URL et BASE_PATH sont fournis par le workflow GitHub Pages.
// Sans eux (VPS, domaine perso), le site est servi à la racine.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://claude-boulay.github.io',
  base: process.env.BASE_PATH ?? '/',
});
