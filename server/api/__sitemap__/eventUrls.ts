import { getAllActiveEvents } from "~/server/services/event";

const config = useRuntimeConfig();

export default defineSitemapEventHandler(async () => {
  const events = await getAllActiveEvents();
  const urls = events.map((event) =>
    asSitemapUrl({
      loc: `${config.public.siteUrl}/event/${event.slug}`,
      changefreq: "weekly",
      priority: 1,
      lastmod: event.updatedAt,
    }),
  );
  return urls;
});
