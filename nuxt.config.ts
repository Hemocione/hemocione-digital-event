function getEnv(key: string, fallback: string) {
  return key ? process.env[key] : fallback
}

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
      googleMapsApiKey: getEnv("GOOGLE_MAPS_API_KEY", "mock-key"),
      siteUrl,
    },
    cdn: {
      bucket: getEnv("CDN_BUCKET", "hemocione-assets"),
      basePath: getEnv("CDN_BASE_PATH", "events/uploads"),
      baseUrl: getEnv("CDN_BASE_URL", "https://cdn.hemocione.com.br"),
    },
    secret: getEnv("API_SECRET", "secret"),
    mongodbUri: getEnv(
      "MONGODB_URI",
      "mongodb://admin:password@localhost:27017"
    ),
    dbName: getEnv("DB_NAME", "local"),
    inngestKey: getEnv("INNGEST_EVENT_KEY", "mock-key"),
    digitalStandApiUrl: getEnv(
      "DIGITAL_STAND_API_URL",
      "https://us-east1-estande-digital.cloudfunctions.net/api"
    ),
    digitalStandApiSecret: getEnv("DIGITAL_STAND_API_SECRET", ""),
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
