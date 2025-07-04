<template>
  <CommonCoolFooter v-if="buttons.length && !loading" height="fit-content">
    <ElButton
      v-for="button in buttons"
      :key="button.label"
      :type="button.type"
      :disabled="button.disabled"
      size="large"
      @click="button.action"
    >
      {{ button.label }}
    </ElButton>
  </CommonCoolFooter>
</template>

<script setup lang="ts">
import { isTodayAndPast } from "~/helpers/todayAndPast";

const props = defineProps({
  eventSlug: {
    type: String,
    required: true,
  },
  registerDonationUrl: {
    type: String as PropType<string | null>,
    default: null,
  },
});

const eventStore = useEventStore();
const userStore = useUserStore();
const { user } = userStore;
const subscription = await userStore.getSubscription(props.eventSlug);
const eventConfig = await eventStore.getEvent(props.eventSlug);

interface Button {
  label: string;
  type: "primary" | "default";
  disabled?: boolean;
  visible: boolean;
  action?: () => void;
}

const loading = ref(true);

const isVolunteer = ref(false);

onMounted(async () => {
  loading.value = false;
  isVolunteer.value = await userStore.userIsVolunteer(props.eventSlug);
});

const isEventTodayAndAlreadyStarted = computed(() => {
  if (!eventConfig.startAt) return false;

  return isTodayAndPast(eventConfig.startAt);
});

const ONE_DAYS_MS = 24 * 60 * 60 * 1000;

const isEventTwoDaysFromNowOrMore = computed(() => {
  if (!eventConfig.startAt) return false;

  const startAt = new Date(eventConfig.startAt).getTime();
  const today = new Date().getTime();

  const dif = startAt - today;

  return dif < ONE_DAYS_MS;
});

const eventDateObj = computed(() => {
  if (!eventConfig.startAt) return null;

  return readableSlimDate(eventConfig.startAt);
});

const participants = computed(() => {
  if (!eventConfig.subscription?.enabled) return null;

  return eventConfig.subscription.schedules.reduce(
    (acc, schedule) => acc + schedule.occupiedSlots,
    0,
  );
});

const slots = computed(() => {
  if (!eventConfig.subscription?.enabled) return null;

  return eventConfig.subscription.schedules.reduce(
    (acc, schedule) => acc + schedule.slots,
    0,
  );
});

const isFull = computed(() => {
  if (!eventConfig.subscription?.enabled || !slots.value) return false;

  return (participants.value || 0) >= slots.value;
});

const registerDonationDateLimitIsOver = computed(() => {
  if (!eventConfig.registerDonationDateLimit) return false;

  const registerDonationDateLimit = new Date(
    eventConfig.registerDonationDateLimit,
  );
  const now = new Date();
  return now > registerDonationDateLimit;
});

const lastSubscriptionSchedule = computed(() => {
  if (!eventConfig.subscription?.enabled) return null;
  const schedules = eventConfig.subscription.schedules;
  return schedules[schedules.length - 1];
});

const hasLastSubscriptionSchedulePassed = computed(() => {
  if (!lastSubscriptionSchedule.value) return false;

  const lastScheduleDate = new Date(lastSubscriptionSchedule.value.startAt);
  const now = new Date();
  return now > lastScheduleDate;
});

const isCanDonateOn = computed(() => {
  const config = eventConfig?.preScreening;
  return config && !config.disabled;
});

const buttons = computed((): Button[] => {
  const isLogged = Boolean(user);
  const hasSubscription = Boolean(subscription);
  const alreadyStarted = isEventTodayAndAlreadyStarted.value;
  const isSchedulesEnabled = eventConfig.subscription?.enabled;
  const subscriptionsAvailable = !hasLastSubscriptionSchedulePassed.value;
  const volunteeringAvailable =
    eventConfig.externalVolunteers?.enabled &&
    (eventConfig?.externalVolunteers?.occupiedSlots || 0) <
      (eventConfig?.externalVolunteers?.slots || 0);
  const computedButtons = [
    {
      label: "Registrar doação",
      type: "primary",
      visible:
        alreadyStarted &&
        props.registerDonationUrl &&
        !registerDonationDateLimitIsOver.value,
      action: goToRegisterDonation,
    },
    {
      label: `Registre sua doação no dia ${eventDateObj.value?.day}, a partir das ${eventDateObj.value?.hour}`,
      visible: !alreadyStarted && Boolean(props.registerDonationUrl),
      disabled: true,
      type: "default",
    },
    {
      label: isVolunteer.value
        ? "Acessar instruções de voluntariado"
        : "Ajude na organização do evento",
      type: "default",
      visible:
        isVolunteer.value ||
        (volunteeringAvailable && !isEventTwoDaysFromNowOrMore.value),
      action: goToExternalVolunteerSubscription,
    },
    {
      label: "Inscrever-se para doar sangue",
      type: "primary",
      visible:
        isSchedulesEnabled &&
        subscriptionsAvailable &&
        !hasSubscription &&
        !isFull.value,
      action: () => goToPreScreeningOrSchedule(props.eventSlug),
    },
    {
      label: "Acessar ingresso",
      type: "primary",
      visible:
        isSchedulesEnabled &&
        (hasSubscription ||
          (!subscriptionsAvailable && !isLogged) ||
          (isFull.value && !isLogged)),
      action: goToTicket,
    },
    {
      label: "Vagas esgotadas",
      type: "primary",
      disabled: true,
      visible:
        isSchedulesEnabled &&
        isFull.value &&
        !hasSubscription &&
        subscriptionsAvailable &&
        isLogged,
    },
    {
      label: "Inscrições encerradas",
      type: "primary",
      disabled: true,
      visible:
        isSchedulesEnabled &&
        !subscriptionsAvailable &&
        isLogged &&
        !hasSubscription,
    },
  ];
  return computedButtons.filter((button) => button.visible) as Button[];
});

const groupedButtonsByType = computed(
  (): Record<"default" | "primary", Button[]> => {
    const groupedButtons = buttons.value.reduce(
      (acc, button) => {
        if (!acc[button.type]) {
          acc[button.type] = [];
        }
        acc[button.type].push(button);
        return acc;
      },
      {} as Record<string, Button[]>,
    );
    return groupedButtons;
  },
);

function goToPreScreeningOrSchedule(eventSlug: string) {
  const lastPreScreeningStr = localStorage.getItem(`lastPreScreening_${eventSlug}`);
  if (lastPreScreeningStr) {
    try {
      const lastPreScreening = JSON.parse(lastPreScreeningStr);
      if (lastPreScreening.answeredAt) {
        const answeredAt = new Date(lastPreScreening.answeredAt);
        const now = new Date();
        const diffMonths = (now.getTime() - answeredAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
        if (diffMonths <= 1) {
          navigateTo(`/event/${eventSlug}/schedules`);
          return;
        }
      }
    } catch (e) {
      // Continue to pre screening
    }
  }
  navigateTo(`/event/${eventSlug}/pre-screening`);
}

function goToSchedule() {
  navigateTo(`/event/${props.eventSlug}/schedules`);
}

function goToTicket() {
  navigateTo(`/event/${props.eventSlug}/ticket`);
}

function goToRegisterDonation() {
  navigateTo(props.registerDonationUrl, { external: true });
}

function goToExternalVolunteerSubscription() {
  navigateTo(`/event/${props.eventSlug}/volunteer`);
}
</script>

<style scoped>
button {
  height: 45px;
  margin: 0;
  text-align: center;
}

.button-group-wrapper {
  width: 100%;
  display: flex;
  gap: 1em;
  justify-content: center;
  align-items: center;
}

.button-group-wrapper > * {
  flex: 1;
}
</style>
