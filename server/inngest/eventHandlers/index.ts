import type {
  QueueParticipantsCalledEvent,
  eventName as queueParticipantsCalledEventName,
} from "./queueParticipantsCalled";
import queueParticipantsCalled from "./queueParticipantsCalled";

import type {
  NotifyCalledParticipant,
  eventName as notifyEventName,
} from "./notifyCalledParticipant";
import notifyCalledParticipant from "./notifyCalledParticipant";

import type {
  NotifyCloseToCallParticipant,
  eventName as notifyCloseToCallEventName,
} from "./notifyCloseToCallParticipant";
import notifyCloseToCallParticipant from "./notifyCloseToCallParticipant";

export interface Events {
  [queueParticipantsCalledEventName]: QueueParticipantsCalledEvent;
  [notifyEventName]: NotifyCalledParticipant;
  [notifyCloseToCallEventName]: NotifyCloseToCallParticipant;
}

const eventHandlers = [
  queueParticipantsCalled,
  notifyCalledParticipant,
  notifyCloseToCallParticipant,
];

export default eventHandlers;
