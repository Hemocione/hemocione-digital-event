const getSiteUrl = () => {
  if (process.env.VERCEL_ENV === "preview") {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.VERCEL_ENV === undefined) {
    return "http://localhost:3000";
  }

  return "https://eventos.hemocione.com.br";
};

const siteUrl = getSiteUrl();
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "mock-key",
      siteUrl,
      authCookieKey: process.env.HEMOCIONE_AUTH_COOKIE_KEY ?? "hemocioneId",
      hemocioneIdUrl:
        process.env.HEMOCIONE_ID_URL ?? "https://id.hemocione.com.br",
      firebaseVapidKey: process.env.FIREBASE_VAPID_KEY ?? "mock-key",
    },
    cdn: {
      bucket: process.env.CDN_BUCKET ?? "hemocione-assets",
      basePath: process.env.CDN_BASE_PATH ?? "events/uploads",
      baseUrl: process.env.CDN_BASE_URL ?? "https://cdn.hemocione.com.br",
    },
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY ?? "mock-key",
      authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? "mock-key",
      projectId: process.env.FIREBASE_PROJECT_ID ?? "mock-key",
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? "mock-key",
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? "mock-key",
      appId: process.env.FIREBASE_APP_ID ?? "mock-key",
    },
    secret: process.env.API_SECRET ?? "secret",
    mongodbUri:
      process.env.MONGODB_URI ?? "mongodb://admin:password@localhost:27017",
    dbName: process.env.DB_NAME ?? "local",
    inngestKey: process.env.INNGEST_EVENT_KEY ?? "mock-key",
    digitalStandApiUrl:
      process.env.DIGITAL_STAND_API_URL ??
      "https://us-east1-estande-digital.cloudfunctions.net/api",
    digitalStandApiSecret: process.env.DIGITAL_STAND_API_SECRET ?? "",
  },
  modules: [
    "@element-plus/nuxt",
    "@nuxtjs/google-fonts",
    "@nuxt/image",
    "nuxt-vercel-analytics",
    "@nuxtseo/module",
  ],
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
      name: "slide-left",
      mode: "out-in",
      appear: true,
    },
    layoutTransition: {
      name: "slide-left",
      mode: "out-in",
    },
  },
  sitemap: {
    cacheMaxAgeSeconds: 2160, // 6 hours
    sources: ["/api/__sitemap__/eventUrls"],
    exclude: ["/queue/**"],
  },
  site: {
    url: siteUrl,
    name: "Hemocione Eventos",
    description: "Eventos de Doação de Sangue do Hemocione",
    defaultLocale: "pt-BR",
    identity: {
      type: "Organization",
    },
    email: "contato@hemocione.com.br",
    twitter: "@hemocione",
    facebook: "hemocione",
    instagram: "@hemocione",
  },
  image: {
    domains: ["cdn.hemocione.com.br"],
    alias: {
      cdn: "https://cdn.hemocione.com.br",
    },
  },
  experimental: {
    componentIslands: true,
  },
});
