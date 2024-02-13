<template>
  <CommonCoolFooter height="fit-content">
    <ElButton
      v-for="button in buttons"
      :key="button.label"
      :type="button.type"
      :disabled="!button.action"
      size="large"
      @click="button.action"
    >
      {{ button.label }}
    </ElButton>
  </CommonCoolFooter>
</template>

<script setup lang="ts">
import dayjs from "dayjs";

interface Button {
  label: string;
  type?: "primary";
  visible: boolean;
  action?: () => void;
}

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
const { user } = useUserStore();
const subscription = await eventStore.getSubscription(props.eventSlug);
const eventConfig = await eventStore.getEvent(props.eventSlug);

const isEventTodayAndAlreadyStarted = computed(() => {
  if (!eventConfig.startAt) return false;

  const startAt = new Date(eventConfig.startAt);
  const today = new Date();

  const isToday = dayjs(startAt).isSame(today, "day");
  const hasStarted = dayjs(startAt).isBefore(today);

  return isToday && hasStarted;
});
const isSchedulesEnabled = computed(() => eventConfig.subscription?.enabled);

const buttons = computed((): Button[] => {
  const isLogged = !!user;
  const hasSubscription = !!subscription;
  const alreadyStarted = isEventTodayAndAlreadyStarted.value;

  const computedButtons = [
    {
      label: "Registrar doação",
      visible: alreadyStarted && props.registerDonationUrl,
      action: goToRegisterDonation,
    },
    {
      label: "Agendar horário",
      type: "primary",
      visible: isSchedulesEnabled.value && !alreadyStarted && !hasSubscription,
      action: goToSchedule,
    },
    {
      label: "Acessar ingresso",
      type: "primary",
      visible: hasSubscription || (alreadyStarted && !isLogged),
      action: goToTicket,
    },
    {
      label: "Você não agendou",
      type: "primary",
      visible:
        isSchedulesEnabled.value && alreadyStarted && isLogged && !subscription,
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
