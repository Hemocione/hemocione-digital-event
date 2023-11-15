import { getAllActiveEvents } from "~/server/services/event";

export default defineSitemapEventHandler(async () => {
  const events = await getAllActiveEvents();
  const urls = events.map((event) =>
    asSitemapUrl({
      loc: `https://eventos.hemocione.com.br/event/${event.slug}`,
      changefreq: "weekly",
      priority: 1,
      lastmod: event.updatedAt,
    }),
  );
  return urls;
});
