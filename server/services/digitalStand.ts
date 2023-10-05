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
    throw new Error("Error sending status");
  }
};
