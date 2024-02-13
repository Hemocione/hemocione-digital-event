export function formatTimeDuration(
  rawStartAt: string,
  rawEndAt: string,
): string {
  const startAt = new Date(rawStartAt);
  const endAt = new Date(rawEndAt);
  const sameDay = startAt.getDate() === endAt.getDate();

  const startAtText = startAt.toLocaleString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    timeZone: "America/Sao_Paulo",
  });

  const endAtText = sameDay
    ? endAt.toLocaleString("pt-BR", {
        hour: "numeric",
        minute: "numeric",
        timeZone: "America/Sao_Paulo",
      })
    : endAt.toLocaleString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZone: "America/Sao_Paulo",
      });
  return `${startAtText} - ${endAtText}`;
}

export interface Address {
  address: string;
  city: string;
  state: string;
}

export function formatAddress(address: Address): string {
  return `${address.address} - ${address.city}, ${address.state}`;
}
