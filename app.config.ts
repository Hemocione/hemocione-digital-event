// const urlPatternsToIgnore = ["/backoffice", "/bloodbag"]; maybe add in the future
const urlPatternsToIgnore = ["/private"];

export default defineAppConfig({
  vercelAnalytics: {
    mode: "auto",
    beforeSend: (event: any) => {
      if (urlPatternsToIgnore.some((pattern) => event.url.includes(pattern)))
        return null;

      return event;
    },
  },
});
