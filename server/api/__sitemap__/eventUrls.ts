import { getAllActiveEvents } from "~/server/services/event";
import { getEventUrl } from "~/server/utils/eventUrl";

export default defineSitemapEventHandler(async () => {
  const events = await getAllActiveEvents();
  const urls = events.map((event) =>
    asSitemapUrl({
      loc: getEventUrl(event.slug),
      changefreq: "weekly",
      priority: 1,
      lastmod: event.updatedAt,
    }),
  );
  return urls;
});
