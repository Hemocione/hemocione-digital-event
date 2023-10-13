export default defineNuxtConfig({
  runtimeConfig: {
    cdn: {
      bucket: process.env.CDN_BUCKET ?? "hemocione-assets",
      basePath: process.env.CDN_BASE_PATH ?? "events/uploads",
      baseUrl: process.env.CDN_BASE_URL ?? "https://cdn.hemocione.com.br",
    },
    secret: process.env.API_SECRET ?? "secret",
    mongodbUri:
      process.env.MONGODB_URI ?? "mongodb://admin:password@localhost:27017",
    dbName: process.env.DB_NAME ?? "hemo",
    inngestKey: process.env.INNGEST_EVENT_KEY ?? "mock-key",
    digitalStandApiUrl:
      process.env.DIGITAL_STAND_API_URL ??
      "https://us-east1-estande-digital.cloudfunctions.net/api",
    digitalStandApiSecret: process.env.DIGITAL_STAND_API_SECRET,
  },
  modules: ["@element-plus/nuxt", "@nuxtjs/google-fonts", "@nuxt/image"],
  nitro: {
    preset: "vercel",
    plugins: ["~/server/plugins/mongoose.ts"],
  },
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
  css: ["~/assets/css/global.css", "~/assets/css/transitions.css"],
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
});
