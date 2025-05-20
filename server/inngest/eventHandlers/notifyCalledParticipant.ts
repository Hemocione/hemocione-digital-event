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
    id: "notify-participant-called-handler",
  },
  {
    event: eventName,
  },
  async ({ event }) => {
    const { data } = event;
    const { phone, name, leadId, uuid } = data;

    let text = `Olá ${name}, é a sua vez de doar! Por favor, dirija-se ao local de doação. O Hemocione agradece!`;
    if (leadId && uuid) {
      try {
        const ticketUrl = getDigitalStandTicketUrl(leadId, uuid);
        text = `Olá ${name}, é a sua vez de doar! Por favor, dirija-se ao local de doação e apresente seu ticket digital usando este link: ${ticketUrl}. O Hemocione agradece!`;
        await updateStatus(leadId, uuid, "success");
      } catch (error) {
        console.error(error);
      }
    }

    await sendSMS(phone, text);
  },
);
