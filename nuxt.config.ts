export default defineNuxtConfig({
  modules: ["@nuxtjs/eslint-module", "@nuxtjs/i18n", "nuxt-mongoose"],
  nitro: {
    preset: "vercel-edge",
  },
  devtools: {
    enabled: true,
  },
});
