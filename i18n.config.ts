import locales from "./locales";

export default defineI18nConfig(() => ({
  legacy: false,
  locale: "pt-BR",
  messages: locales,
}));
