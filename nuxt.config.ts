import ElementPlus from "unplugin-element-plus/vite";

export default defineNuxtConfig({
  runtimeConfig: {
    mongodbUri:
      process.env.MONGODB_URI ?? "mongodb://admin:password@localhost:27017",
    dbName: process.env.DB_NAME ?? "hemo",
    inngestKey: process.env.INNGEST_EVENT_KEY ?? "mock-key",
  },
  modules: [
    "@nuxtjs/eslint-module",
    "@nuxtjs/i18n",
    "@element-plus/nuxt",
    "@nuxtjs/google-fonts",
  ],
  nitro: {
    preset: "vercel",
    plugins: ["~/server/plugins/mongoose.ts"],
  },
  devtools: {
    enabled: true,
  },
  css: ["~/assets/css/global.scss"],
  googleFonts: {
    families: {
      Roboto: true,
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/assets/css/variables.scss" as *;`,
        },
      },
    },
    plugins: [
      ElementPlus({
        useSource: true,
      }),
    ],
  },
});
