import { inngest } from "~/server/inngest/client";
import { setNotifiedCloseToCall } from "~/server/services/queueParticipants";
import { sendSMS } from "~/server/services/sms";

export interface NotifyCloseToCallParticipant {
  data: {
    phone: string;
    name: string;
    _id: string;
  };
}

export const eventName = "notify/participant.closeToCall";

export default inngest.createFunction(
  {
    name: "Notify Participant Close To Call Handler",
    id: "notify-participant-close-to-call-handler",
  },
  {
    event: eventName,
  },
  async ({ event }) => {
    const { data } = event;
    const { phone, name } = data;

    const text = `Olá ${name}, a sua vez de doar está próxima! Por favor, fique próximo ao local de doação e aguarde a chamada.  O Hemocione agradece!`;
    await sendSMS(phone, text);

    await setNotifiedCloseToCall(data._id);
  },
);
