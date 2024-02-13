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
import { isTodayAndPast } from '~/helpers/todayAndPast';

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
const { user } = userStore
const subscription = await userStore.getSubscription(props.eventSlug);
const eventConfig = await eventStore.getEvent(props.eventSlug);

const isEventTodayAndAlreadyStarted = computed(() => {
  if (!eventConfig.startAt) return false;

  return isTodayAndPast(eventConfig.startAt);
});

const buttons = computed((): Button[] => {
  const isLogged = Boolean(user);
  const hasSubscription = Boolean(subscription);
  const alreadyStarted = isEventTodayAndAlreadyStarted.value;
  const isSchedulesEnabled = eventConfig.subscription?.enabled;
  console.dir(eventConfig, { depth: null })

  const computedButtons = [
    {
      label: "Registrar doação",
      visible: alreadyStarted && props.registerDonationUrl,
      action: goToRegisterDonation,
    },
    {
      label: "Agendar horário",
      type: "primary",
      visible: isSchedulesEnabled && !alreadyStarted && !hasSubscription,
      action: goToSchedule,
    },
    {
      label: "Acessar ingresso",
      type: "primary",
      visible: isSchedulesEnabled && (hasSubscription || (alreadyStarted && !isLogged)),
      action: goToTicket,
    },
    {
      label: "Inscrições encerradas",
      type: "primary",
      disabled: true,
      visible:
        isSchedulesEnabled && alreadyStarted && isLogged && !hasSubscription,
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
