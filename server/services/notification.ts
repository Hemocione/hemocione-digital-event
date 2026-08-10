import {
  NotificationPreference,
  type NotificationChannel,
} from "../models/notificationPreference";
import {
  EventNotification,
  type EventNotificationType,
} from "../models/eventNotification";
import type { Types } from "mongoose";
import { sendSMS } from "./sms";
import { getDiscordNotificationService } from "./discord";

export interface CreateNotificationPreferenceDTO {
  hemocioneId: string;
  channels?: {
    push?: { enabled: boolean; token?: string };
    whatsapp?: { enabled: boolean; phone?: string };
    email?: { enabled: boolean; address?: string };
    sms?: { enabled: boolean; phone?: string };
  };
  eventReminderHours?: number[];
}

export interface UpdateNotificationPreferenceDTO {
  channels?: {
    push?: { enabled?: boolean; token?: string };
    whatsapp?: { enabled?: boolean; phone?: string };
    email?: { enabled?: boolean; address?: string };
    sms?: { enabled?: boolean; phone?: string };
  };
  eventReminderHours?: number[];
}

export async function getNotificationPreference(hemocioneId: string) {
  return await NotificationPreference.findOne({ hemocioneId }).lean();
}

export async function createNotificationPreference(
  data: CreateNotificationPreferenceDTO,
) {
  const preference = new NotificationPreference(data);
  return (await preference.save()).toObject();
}

export async function updateNotificationPreference(
  hemocioneId: string,
  data: UpdateNotificationPreferenceDTO,
) {
  const preference = await NotificationPreference.findOneAndUpdate(
    { hemocioneId },
    { $set: data },
    { new: true, lean: true },
  );
  return preference;
}

export interface SendNotificationDTO {
  eventId: Types.ObjectId;
  hemocioneId: string;
  type: EventNotificationType;
  channel: NotificationChannel;
  messageContent: string;
  recipientAddress: string; // phone, email, or push token
}

export async function createEventNotificationRecord(
  data: SendNotificationDTO,
) {
  const notification = new EventNotification({
    eventId: data.eventId,
    hemocioneId: data.hemocioneId,
    type: data.type,
    channel: data.channel,
    messageContent: data.messageContent,
    status: "pending",
  });
  return (await notification.save()).toObject();
}

export async function markNotificationAsSent(
  notificationId: Types.ObjectId,
) {
  return await EventNotification.findByIdAndUpdate(
    notificationId,
    {
      $set: {
        status: "sent",
        sentAt: new Date(),
      },
    },
    { new: true, lean: true },
  );
}

export async function markNotificationAsFailed(
  notificationId: Types.ObjectId,
  errorMessage: string,
) {
  return await EventNotification.findByIdAndUpdate(
    notificationId,
    {
      $set: {
        status: "failed",
        failedAt: new Date(),
        errorMessage,
      },
    },
    { new: true, lean: true },
  );
}

export async function getPendingNotifications() {
  return await EventNotification.find({
    status: "pending",
  }).lean();
}

export async function getNotificationsByEventAndUser(
  eventId: Types.ObjectId,
  hemocioneId: string,
) {
  return await EventNotification.find({
    eventId,
    hemocioneId,
  }).lean();
}

export async function hasNotificationBeenSent(
  eventId: Types.ObjectId,
  hemocioneId: string,
  type: EventNotificationType,
  channel: NotificationChannel,
): Promise<boolean> {
  const notification = await EventNotification.findOne({
    eventId,
    hemocioneId,
    type,
    channel,
    status: { $in: ["sent", "pending"] },
  });
  return !!notification;
}

// Send notification through appropriate channel
export async function sendNotification(
  notificationId: Types.ObjectId,
  channel: NotificationChannel,
  recipientAddress: string,
  messageContent: string,
): Promise<boolean> {
  try {
    switch (channel) {
      case "sms":
        await sendSMS(recipientAddress, messageContent);
        break;
      case "whatsapp":
        // WhatsApp implementation - using SMS for now as placeholder
        // TODO: Integrate with WhatsApp Business API
        await sendSMS(recipientAddress, messageContent);
        break;
      case "email":
        // Email implementation
        // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
        console.log(`[EMAIL] To: ${recipientAddress}, Message: ${messageContent}`);
        break;
      case "push":
        // Push notification implementation
        // TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
        console.log(`[PUSH] To: ${recipientAddress}, Message: ${messageContent}`);
        break;
      default:
        throw new Error(`Unsupported notification channel: ${channel}`);
    }

    await markNotificationAsSent(notificationId);
    return true;
  } catch (error: any) {
    await markNotificationAsFailed(notificationId, error.message || String(error));
    
    // Log error to Discord
    const discord = getDiscordNotificationService();
    await discord.sendErrorNotification(
      error,
      `Failed to send ${channel} notification to ${recipientAddress}`,
    );
    
    return false;
  }
}

// Build notification message based on type
export function buildNotificationMessage(
  type: EventNotificationType,
  eventName: string,
  eventStartAt: Date,
  eventAddress?: string,
): string {
  const formattedDate = eventStartAt.toLocaleString("pt-BR", {
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "numeric",
    timeZone: "America/Sao_Paulo",
  });

  switch (type) {
    case "24h-reminder":
      return `Lembrete: O evento "${eventName}" acontece amanhã (${formattedDate})${eventAddress ? ` em ${eventAddress}` : ""}. Não se esqueça de levar seu documento com foto e cumprir os requisitos para doação. Obrigado por salvar vidas!`;
    case "2h-reminder":
      return `O evento "${eventName}" começa em 2 horas!${eventAddress ? ` Local: ${eventAddress}` : ""}. Te esperamos lá!`;
    case "1h-reminder":
      return `O evento "${eventName}" começa em 1 hora!${eventAddress ? ` Local: ${eventAddress}` : ""}. Venha fazer a diferença!`;
    default:
      return `Lembrete do evento "${eventName}" em ${formattedDate}${eventAddress ? ` - ${eventAddress}` : ""}`;
  }
}
