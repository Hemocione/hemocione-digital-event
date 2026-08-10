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

import type {
  NotifyNewParticipant,
  eventName as notifyNewEventName,
} from "./notifyNewParticipant";
import notifyNewParticipant from "./notifyNewParticipant";

import type {
  ComputeEventDonations,
  eventName as computeEventDonationsEventName,
} from "./computeEventDonations";
import computeEventDonations from "./computeEventDonations";

import type {
  EventReminderEvent,
  eventName as eventReminderEventName,
} from "./sendEventReminders";
import sendEventReminders from "./sendEventReminders";

export interface Events {
  [queueParticipantsCalledEventName]: QueueParticipantsCalledEvent;
  [notifyEventName]: NotifyCalledParticipant;
  [notifyCloseToCallEventName]: NotifyCloseToCallParticipant;
  [notifyNewEventName]: NotifyNewParticipant;
  [computeEventDonationsEventName]: ComputeEventDonations;
  [eventReminderEventName]: EventReminderEvent;
}

const eventHandlers = [
  queueParticipantsCalled,
  notifyCalledParticipant,
  notifyCloseToCallParticipant,
  notifyNewParticipant,
  computeEventDonations,
  sendEventReminders,
];

export default eventHandlers;
