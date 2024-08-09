export async function sendSlackMessage(message: string, webhookUrl: string) {
  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: message }),
  });
}
