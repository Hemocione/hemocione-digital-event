import { inngest } from "~/server/inngest/client";

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
  ({ event }) => {
    const { data } = event;
    const { phone, name } = data;

    const text = `Olá ${name}, é a sua vez de doar! Por favor, dirija-se ao local de doação. O Hemocione agradece!`;
    console.log(`Sending SMS to ${phone}: ${text}`);
    // TODO: Send SMS
  },
);
