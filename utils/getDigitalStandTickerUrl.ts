export const getDigitalStandTicketUrl = (leadId: string, uuid: string) =>
  `https://estande-digital.layers.digital/leadIntent?leadId=${leadId}&${uuid}`;
