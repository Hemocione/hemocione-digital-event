import _ from "lodash";
import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
} from "@aws-sdk/client-sqs";
import type { Donation } from "./hemocioneId";

const config = useRuntimeConfig();
const sqsClient = new SQSClient();
const queueUrl = config.donationsQueueUrl;

interface User {
  hemocioneId?: string | null;
  email?: string | null;
  phone?: string | null;
  document?: string;
}

interface DonationQueueMessage {
  secret: string;
  donation: Donation;
  user: User;
}

export async function sendMessage(message: DonationQueueMessage) {
  const stringifiedMessage = JSON.stringify(message);
  console.log(`Sending message ${stringifiedMessage} to queue ${queueUrl}`);
  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: stringifiedMessage,
  });

  await sqsClient.send(command);
}

async function sendMessageBatch(messages: DonationQueueMessage[]) {
  console.log(`Sending ${messages.length} messages to queue ${queueUrl}`);
  const now = new Date().getTime();
  const command = new SendMessageBatchCommand({
    QueueUrl: queueUrl,
    Entries: messages.map((message, index) => {
      const entryId = `${message.donation.donationProviderDonationId}-${index}-${now}`;
      const entryIdOnlyAllowedChars = entryId
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, 80); // SQS entryId has a limit of 80 characters and only allows alphanumeric characters, hyphens, and underscores
      return {
        Id: entryIdOnlyAllowedChars,
        MessageBody: JSON.stringify(message),
      };
    }),
  });

  await sqsClient.send(command);
}

const CHUNK_SIZE = 10;

export async function sendMessagesInChunks(messages: DonationQueueMessage[]) {
  const chunks = _.chunk(messages, CHUNK_SIZE);
  for (const chunk of chunks) {
    await sendMessageBatch(chunk);
  }
}
