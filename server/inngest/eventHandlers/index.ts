import queueParticipantsCalled, {
  eventName as queueParticipantsCalledEventName,
  QueueParticipantsCalledEvent,
} from "./queueParticipantsCalled";

import notifyCalledParticipant, {
  NotifyCalledParticipant,
  eventName as notifyEventName,
} from "./notifyCalledParticipant";

import notifyCloseToCallParticipant, {
  NotifyCloseToCallParticipant,
  eventName as notifyCloseToCallEventName,
} from "./notifyCloseToCallParticipant";

export type Events = {
  [queueParticipantsCalledEventName]: QueueParticipantsCalledEvent;
  [notifyEventName]: NotifyCalledParticipant;
  [notifyCloseToCallEventName]: NotifyCloseToCallParticipant;
};

const eventHandlers = [
  queueParticipantsCalled,
  notifyCalledParticipant,
  notifyCloseToCallParticipant,
];

export default eventHandlers;
