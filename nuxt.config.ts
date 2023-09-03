export default defineNuxtConfig({
  runtimeConfig: {
    mongodbUri:
      process.env.MONGODB_URI ?? "mongodb://admin:password@localhost:27017",
    dbName: process.env.DB_NAME ?? "hemo",
  },
  modules: ["@nuxtjs/eslint-module", "@nuxtjs/i18n"],
  nitro: {
    preset: "vercel-edge",
    plugins: ["~/server/plugins/mongoose.ts"],
  },
  devtools: {
    enabled: true,
  },
});
