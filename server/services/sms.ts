import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

const snsClient = new SNSClient();

export async function sendSMS(phone: string, message: string) {
  const params = new PublishCommand({
    Message: `HEMOCIONE: ${message.trim()}`,
    PhoneNumber: phone,
  });

  await snsClient.send(params);
}
