const config = useRuntimeConfig();

const digitalStandApiUrl = config.digitalStandApiUrl;

export const sendStatus = async (
  leadId: string,
  uuid: string,
  status: string,
) => {
  // TODO: implement correctly
  const response = await fetch(
    `${digitalStandApiUrl}/api/v1/leads/${leadId}/status`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${uuid}`,
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
