import ElementPlus from "unplugin-element-plus/vite";

export default defineNuxtConfig({
  runtimeConfig: {
    mongodbUri:
      process.env.MONGODB_URI ?? "mongodb://admin:password@localhost:27017",
    dbName: process.env.DB_NAME ?? "hemo",
    inngestKey: process.env.INNGEST_EVENT_KEY ?? "mock-key",
    digitalStandApiUrl:
      process.env.DIGITAL_STAND_API_URL ??
      "https://us-east1-estande-digital.cloudfunctions.net/api",
  },
  modules: ["@element-plus/nuxt", "@nuxtjs/google-fonts", "@nuxt/image"],
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
  app: {
    pageTransition: {
      name: "slide-fade-right",
      mode: "out-in",
      appear: true,
    },
    layoutTransition: {
      name: "slide-fade-right",
      mode: "out-in",
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/css/variables.scss" as *;',
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
