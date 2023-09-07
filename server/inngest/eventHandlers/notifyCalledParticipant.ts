import { inngest } from "~/server/inngest/client";
import { sendSMS } from "~/server/services/sms";

export type NotifyCalledParticipant = {
  data: {
    _id: string;
    phone: string;
    name: string;
  };
};

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
    const { phone, name } = data;

    const text = `Olá ${name}, é a sua vez de doar! Por favor, dirija-se ao local de doação. O Hemocione agradece!`;
    await sendSMS(phone, text);
  },
);
