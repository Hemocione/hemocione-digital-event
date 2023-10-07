const config = useRuntimeConfig();
const { digitalStandApiUrl, digitalStandApiSecret } = config;

export const updateStatus = async (
  leadId: string,
  uuid: string,
  status: string,
) => {
  const response = await fetch(
    `${digitalStandApiUrl}/integration/lead/status?leadId=${leadId}&uuid=${uuid}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret": digitalStandApiSecret,
      },
      body: JSON.stringify({
        status,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Error sending status to digital stand");
  }
};

export const upsertFBDataOnLead = async (
  leadId: string,
  eventId: string,
  fbData: { fbc?: string; fbp?: string },
) => {
  const response = await fetch(`${digitalStandApiUrl}/lead`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-secret": digitalStandApiSecret,
      "x-event-id": eventId,
      "x-lead-id": leadId,
    },
    body: JSON.stringify(fbData),
  });

  if (!response.ok) throw new Error("Error sending FB data to digital stand");
};

export const getTicketUrl = (leadId: string, uuid: string) =>
  `https://estande-digital.layers.digital/leadIntent?leadId=${leadId}&${uuid}`;
