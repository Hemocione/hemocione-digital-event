const getSiteUrl = () => {
  if (process.env.VERCEL_ENV === "preview") {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.VERCEL_ENV === undefined) {
    const nuxtDevConfig = process.env.__NUXT_DEV__;
    let networkAddress;
    if (nuxtDevConfig) {
      const parsedConfig = JSON.parse(nuxtDevConfig);
      networkAddress = parsedConfig?.proxy?.urls?.find(
        (addr: any) => addr.type === "network",
      )?.url;
    }

    return networkAddress || "http://localhost:3000";
  }
  return "https://eventos.hemocione.com.br";
};
const getCurrentEnv = () => {
  if (process.env.VERCEL_ENV === "preview") {
    return "dev";
  }

  if (process.env.VERCEL_ENV === "production") {
    return "prod";
  }

  return "dev";
};

const siteUrl = getSiteUrl();
const currentEnv = getCurrentEnv();
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "mock-key",
      siteUrl,
      authCookieKey: process.env.HEMOCIONE_AUTH_COOKIE_KEY ?? "hemocioneId",
      hemocioneIdApiUrl:
        process.env.NUXT_HEMOCIONE_ID_API_URL ||
        "https://hemocione-id-dev.cpt.hemocione.com.br",
      hemocioneIdUrl:
        process.env.HEMOCIONE_ID_URL ?? "https://id.d.hemocione.com.br",
    },
    cdn: {
      bucket: process.env.CDN_BUCKET ?? "hemocione-assets",
      basePath: process.env.CDN_BASE_PATH ?? `events/${currentEnv}/uploads`,
      baseUrl: process.env.CDN_BASE_URL ?? "https://cdn.hemocione.com.br",
    },
    hemocioneIdJwtSecretKey:
      process.env.HEMOCIONE_ID_JWT_SECRET_KEY ?? "secret",
    hemocioneIdIntegrationSecret:
      process.env.HEMOCIONE_ID_INTEGRATION_SECRET ?? "secret",
    secret: process.env.API_SECRET ?? "secret",
    mongodbUri:
      process.env.MONGODB_URI ??
      "mongodb://localhost:27017/admin?authSource=admin&readPreference=primary&directConnection=true&ssl=false",
    dbName: process.env.DB_NAME ?? "hemo",
    inngestKey: process.env.INNGEST_EVENT_KEY ?? "mock-key",
    digitalStandApiUrl:
      process.env.DIGITAL_STAND_API_URL ??
      "https://us-east1-estande-digital.cloudfunctions.net/api",
    digitalStandApiSecret: process.env.DIGITAL_STAND_API_SECRET ?? "",
    donationsQueueUrl: process.env.DONATIONS_QUEUE_URL ?? "secret-queue-url",
  },

  modules: [
    "@element-plus/nuxt",
    "@nuxtjs/google-fonts",
    "@nuxt/image",
    "nuxt-vercel-analytics",
    "@nuxtseo/module",
    "@pinia/nuxt",
    "nuxt-bugsnag",
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

  bugsnag: {
    publishRelease: true,
    disableLog: false, // might activate later
    baseUrl: siteUrl,
    config: {
      apiKey: process.env.BUGSNAG_API_KEY,
      enabledReleaseStages: ["prod", "dev"],
      releaseStage: currentEnv,
      appVersion: `${currentEnv}-${process.env.VERCEL_GIT_COMMIT_SHA}`,
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
    exclude: ["/queue/**", "/chart/**"],
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

  routeRules: {
    "/event/:eventSlug/ticket": {
      ssr: false,
    },
    "/event/:eventSlug/schedules": {
      ssr: false,
    },
    "/event/:eventSlug/volunteer/mine": {
      ssr: false,
    },
    "/event/:eventSlug/volunteer": {
      ssr: false,
    },
    "/event/:eventSlug/volunteer/review": {
      ssr: false,
    },
    "/queue/join": {
      ssr: false,
    },
    "/queue/:queueId/participant/:participantId": {
      ssr: false,
    },
    "/chart/line-and-candlestick": {
      ssr: false,
    },
    "/**": { cors: true },
  },

  experimental: {
    componentIslands: true,
  },

  compatibilityDate: "2024-08-01",
});
