import findEventsToSendDonations from "./findEventsToSendDonations";
import upcomingEventNotifications from "./upcomingEventNotifications";

const cronHandlers = [findEventsToSendDonations, upcomingEventNotifications];

export default cronHandlers;
