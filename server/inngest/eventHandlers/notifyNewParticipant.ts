import { inngest } from "~/server/inngest/client";
import { sendSMS } from "~/server/services/sms";
import {
  MAX_CLOSE_TO_CALL,
  setNotifiedCloseToCall,
} from "~/server/services/queueParticipants";

export interface NotifyNewParticipant {
  data: {
    _id: string;
    phone: string;
    name: string;
    position: number;
  };
}

export const eventName = "notify/participant.new";

const handleAndGenerateMessageBasedOnPosition = async (
  _id: string,
  name: string,
  position: number,
) => {
  if (position === 1) {
    await setNotifiedCloseToCall(_id);
    return `Olá ${name}! Você é o próximo a doar! Por favor, mantenha-se próximo ao local de doação e aguarde a chamada.`;
  }
  if (position <= MAX_CLOSE_TO_CALL) {
    await setNotifiedCloseToCall(_id);
    return `Olá ${name}! Você está na posição ${position} da fila. A sua vez de doar está próxima! Por favor, mantenha-se próximo ao local de doação e aguarde a chamada.`;
  }

  return null;
};

export default inngest.createFunction(
  {
    name: "Notify New Participant Handler",
    id: "notify-new-participant-handler",
  },
  {
    event: eventName,
  },
  async ({ event }) => {
    const { data } = event;
    const { _id, phone, name, position } = data;
    const text = await handleAndGenerateMessageBasedOnPosition(
      _id,
      name,
      position,
    );
    if (!text) return;

    await sendSMS(phone, text);
  },
);
