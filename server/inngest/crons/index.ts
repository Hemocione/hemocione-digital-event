import findEventsToSendDonations from "./findEventsToSendDonations";
import findEventsToSendReminders from "./findEventsToSendReminders";

const cronHandlers = [findEventsToSendDonations, findEventsToSendReminders];

export default cronHandlers;
