import { inngest } from "~/server/inngest/client";
import { setNotifiedCloseToCall } from "~/server/services/queueParticipants";
import { sendSMS } from "~/server/services/sms";

export interface NotifyCloseToCallParticipant {
  data: {
    phone: string;
    name: string;
    _id: string;
    queueId: string;
  };
}

export const eventName = "notify/participant.closeToCall";
const config = useRuntimeConfig();

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
    const { _id, phone, name, queueId } = data;

    const url = `${config.public.siteUrl}/queue/${queueId}/participant/${_id}`;
    const text = `Olá ${name}, a sua vez de doar está próxima! Por favor, fique próximo ao local de doação e aguarde a chamada. Acompanhe sua posição na fila no link: ${url}`;
    await sendSMS(phone, text);

    await setNotifiedCloseToCall(data._id);
  },
);
