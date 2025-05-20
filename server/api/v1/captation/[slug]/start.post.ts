import { getDiscordNotificationService } from "~/server/services/discord";

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event);
  const userAgent = event.node.req.headers["user-agent"];
  const discordNotificationService = getDiscordNotificationService();
  const body = await readBody(event);
  const entityType = String(event.context.params?.slug as string);
  const startedAt = new Date().toISOString();

  runAsync(
    discordNotificationService.sendEmbed({
      title: `Captation Form Started - ${entityType}`,
      description: JSON.stringify({
        ...body,
        startedAt,
        ip,
        userAgent,
      }),
      color: 0x0099ff, // blue color
    }),
  );

  return {
    message: "Captation form started",
  };
});
