import _ from "lodash";
import { getUserQueueParticipations } from "~/server/services/queueParticipants";
import { getUserSubscriptions } from "~/server/services/subscription";
import { getUserDonations } from "~/server/services/hemocioneId";
import { useHemocioneUserAuthOrHemocioneIdIntegrationSecret } from "~/server/services/auth";

interface UserData {
  document: string;
  phone: string;
  hemocioneId: string;
  email: string;
}

type MaybeUserData = Partial<UserData>;

function assertUserData(data: MaybeUserData): asserts data is UserData {
  if (!data.document || !data.phone || !data.hemocioneId || !data.email) {
    throw createError({
      statusMessage: "Missing required fields",
      statusCode: 400,
    });
  }
}

export default defineEventHandler(async (event) => {
  const maybeUser = useHemocioneUserAuthOrHemocioneIdIntegrationSecret(event);
  const body = (await readBody(event)) as MaybeUserData | undefined;
  const { phone, hemocioneId, email, document } = body || {};

  const user = _.pick(
    maybeUser
      ? { ...maybeUser, hemocioneId: maybeUser.id }
      : { phone, hemocioneId, email, document },
    ["document", "phone", "hemocioneId", "email"],
  );

  assertUserData(user);

  const [queueParticipations, subscriptions] = await Promise.all([
    getUserQueueParticipations(user),
    getUserSubscriptions(user.hemocioneId),
  ]);

  const donations = await getUserDonations({
    subscriptions,
    queueParticipations,
    user,
  });

  return donations;
});
