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
  SendUpcomingNotifications,
  eventName as sendUpcomingEventName,
} from "./sendUpcomingNotifications";
import sendUpcomingNotifications from "./sendUpcomingNotifications";

export interface Events {
  [queueParticipantsCalledEventName]: QueueParticipantsCalledEvent;
  [notifyEventName]: NotifyCalledParticipant;
  [notifyCloseToCallEventName]: NotifyCloseToCallParticipant;
  [notifyNewEventName]: NotifyNewParticipant;
  [computeEventDonationsEventName]: ComputeEventDonations;
  [sendUpcomingEventName]: SendUpcomingNotifications;
}

const eventHandlers = [
  queueParticipantsCalled,
  notifyCalledParticipant,
  notifyCloseToCallParticipant,
  notifyNewParticipant,
  computeEventDonations,
  sendUpcomingNotifications,
];

export default eventHandlers;
