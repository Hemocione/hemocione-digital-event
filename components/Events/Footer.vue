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

interface Button {
  label: string;
  type?: "primary";
  disabled?: boolean;
  visible: boolean;
  action?: () => void;
}

const loading = ref(true);

onMounted(() => {
  loading.value = false;
});

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

const isEventTodayAndAlreadyStarted = computed(() => {
  if (!eventConfig.startAt) return false;

  return isTodayAndPast(eventConfig.startAt);
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

const buttons = computed((): Button[] => {
  const isLogged = Boolean(user);
  const hasSubscription = Boolean(subscription);
  const alreadyStarted = isEventTodayAndAlreadyStarted.value;
  const isSchedulesEnabled = eventConfig.subscription?.enabled;
  const subscriptionsAvailable = !hasLastSubscriptionSchedulePassed.value;
  const computedButtons = [
    {
      label: "Registrar doação",
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
    },
    {
      label: "Inscrever-se",
      type: "primary",
      visible:
        isSchedulesEnabled &&
        subscriptionsAvailable &&
        !hasSubscription &&
        !isFull.value,
      action: goToSchedule,
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

function goToSchedule() {
  navigateTo(`/event/${props.eventSlug}/schedules`);
}

function goToTicket() {
  navigateTo(`/event/${props.eventSlug}/ticket`);
}

function goToRegisterDonation() {
  navigateTo(props.registerDonationUrl, { external: true });
}
</script>

<style scoped>
button {
  height: 48px;
  margin: 0;
}
</style>
