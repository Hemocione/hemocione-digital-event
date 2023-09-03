export default defineNuxtConfig({
  nitro: {
    preset: "vercel-edge",
  },
  modules: ["@nuxtjs/eslint-module", "@nuxtjs/i18n"],
  devtools: {
    enabled: true,
  },
});
