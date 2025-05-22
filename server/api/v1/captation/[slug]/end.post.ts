import { updateStatus } from "~/server/services/digitalStand";
import { getDiscordNotificationService } from "~/server/services/discord";

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event);
  const userAgent = event.node.req.headers["user-agent"];
  const discordNotificationService = getDiscordNotificationService();
  const body = await readBody(event);

  const { leadId, uuid } = body;
  let promises: Promise<void>[] = [];
  if (leadId && uuid) {
    promises.push(updateStatus(leadId, uuid, "success"));
  }

  const entityType = String(event.context.params?.slug as string);
  const endedAt = new Date().toISOString();
  promises.push(
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

  const allSettledPromise = Promise.allSettled(promises);
  runAsync(allSettledPromise);

  return {
    message: "Captation form ended",
  };
});
