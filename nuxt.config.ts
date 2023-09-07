export default defineNuxtConfig({
  runtimeConfig: {
    mongodbUri:
      process.env.MONGODB_URI ?? "mongodb://admin:password@localhost:27017",
    dbName: process.env.DB_NAME ?? "hemo",
    inngestKey: process.env.INNGEST_EVENT_KEY ?? "mock-key",
  },
  modules: ["@nuxtjs/eslint-module", "@nuxtjs/i18n", "@element-plus/nuxt"],
  nitro: {
    preset: "vercel",
    plugins: ["~/server/plugins/mongoose.ts"],
  },
  devtools: {
    enabled: true,
  },
});
