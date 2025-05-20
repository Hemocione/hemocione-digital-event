import { getDiscordNotificationService } from "~/server/services/discord";

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event);
  const userAgent = event.node.req.headers["user-agent"];
  const discordNotificationService = getDiscordNotificationService();
  const body = await readBody(event);
  const entityType = String(event.context.params?.slug as string);
  const endedAt = new Date().toISOString();
  runAsync(
    discordNotificationService.sendEmbed({
      title: `Captation Form Ended - ${entityType}`,
      description: JSON.stringify({
        ...body,
        endedAt,
        ip,
        userAgent,
      }),
      color: 0x00ff00, // green color
    }),
  );

  return {
    message: "Captation form ended",
  };
});
