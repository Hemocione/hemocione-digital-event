import { inngest } from "~/server/inngest/client";
import { sendSMS } from "~/server/services/sms";
import { updateStatus } from "~/server/services/digitalStand";

export interface NotifyCalledParticipant {
  data: {
    _id: string;
    phone: string;
    name: string;
    leadId?: string | null;
    uuid?: string | null;
  };
}

export const eventName = "notify/participant.called";

export default inngest.createFunction(
  {
    name: "Notify Participant Called Handler",
  },
  {
    event: eventName,
  },
  async ({ event }) => {
    const { data } = event;
    const { phone, name, leadId, uuid } = data;

    if (leadId && uuid) {
      try {
        await updateStatus(leadId, uuid, "success");
      } catch (error) {
        console.error(error);
      }
    }

    const text = `Olá ${name}, é a sua vez de doar! Por favor, dirija-se ao local de doação. O Hemocione agradece!`;
    await sendSMS(phone, text);
  },
);
