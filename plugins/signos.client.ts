let signosInitialized = false;
const LAST_SIGNOS_CHAT_OPENED_TIMESTAMP = "lastSignosChatOpenedDate";
const SIGNOS_CHAT_OPENED_INTERVAL = 1000 * 60 * 60 * 24 * 30; // 30 days to ask again for feedback

export const openSignosChat = () => {
  const lastOpenedTimestamp = localStorage.getItem(
    LAST_SIGNOS_CHAT_OPENED_TIMESTAMP,
  );
  const currentDateTimestamp = new Date().getTime();

  if (
    lastOpenedTimestamp &&
    currentDateTimestamp - Number(lastOpenedTimestamp) <
      SIGNOS_CHAT_OPENED_INTERVAL
  ) {
    return;
  }

  const { user } = useUserStore();
  if (!user) {
    // do nothing if user is not logged in
    return;
  }

  if (!signosInitialized) {
    const config = useRuntimeConfig();
    const { signosOrganizationId } = config.public;

    // @ts-ignore
    window?.signos?.init({
      customerName: user.givenName,
      customerEmail: user.email,
      orgId: signosOrganizationId,
    });
    console.log("Signos chat initialized");

    signosInitialized = true;
  }
  (window as any)?.signos?.toggle();

  localStorage.setItem(
    LAST_SIGNOS_CHAT_OPENED_TIMESTAMP,
    String(currentDateTimestamp),
  );
};

export default defineNuxtPlugin((_nuxtApp) => {
  console.log("Signos plugin loaded!");
});
