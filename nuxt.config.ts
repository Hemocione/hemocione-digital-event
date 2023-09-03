export default defineNuxtConfig({
  modules: ["@nuxtjs/eslint-module", "@nuxtjs/i18n"],
  nitro: {
    preset: "vercel-edge",
  },
  devtools: {
    enabled: true,
  },
});
