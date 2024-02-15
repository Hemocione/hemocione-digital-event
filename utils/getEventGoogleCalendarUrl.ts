import dayjs from "dayjs";

const config = useRuntimeConfig();
const getEventUrlWithAnchor = (eventSlug: string, ctaText: string) =>
  `<a href=${config.public.siteUrl}/event/${eventSlug} target=_blank>${ctaText}</a>`;

export const getEventGoogleCalendarUrl = (event: {
  startAt: string;
  endAt: string;
  location: string;
  eventName: string;
  eventSlug: string;
}) => {
  const text = `HEMOCIONE: Doação de Sangue - ${event.eventName}`;
  const ctaText = getEventUrlWithAnchor(
    event.eventSlug,
    "Veja detalhes do evento e acesse seu ingresso aqui!",
  );
  const description = `Doação de Sangue - ${event.eventName} com o Hemocione. <br/> <br/>${ctaText}<br/>`;
  const { location } = event;
  const startDate = dayjs(event.startAt);
  const endDate = dayjs(event.endAt);
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    text,
  )}&dates=${startDate.format("YYYYMMDDTHHmmss")}/${endDate.format(
    "YYYYMMDDTHHmmss",
  )}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(
    location,
  )}`;
  return calendarUrl;
};
