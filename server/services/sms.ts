import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient();

export const sendSMS = async (phone: string, message: string) => {
  const params = new PublishCommand({
    Message: message,
    PhoneNumber: phone,
  });

  await snsClient.send(params);
};
