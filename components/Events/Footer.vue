<template>
  <CommonCoolFooter v-if="buttons.length && !loading" height="fit-content">
    <!-- <template v-if="buttons.length <= 2"> -->
    <ElButton v-for="button in buttons" :key="button.label" :type="button.type" :disabled="button.disabled" size="large"
      @click="button.action">
      {{ button.label }}
    </ElButton>
    <!-- </template> -->
    <!-- <template v-else> -->
    <!-- <div class="button-group-wrapper">
        <ElButton v-for="button in groupedButtonsByType.default" :key="button.label" :type="button.type"
          :disabled="button.disabled" size="large" @click="button.action">
          {{ button.label }}
        </ElButton>
      </div>
      <ElButton v-for="button in groupedButtonsByType.primary" :key="button.label" :type="button.type"
        :disabled="button.disabled" size="large" @click="button.action">
        {{ button.label }}
      </ElButton>
    </template> -->
  </CommonCoolFooter>
</template>

<script setup lang="ts">
import { isTodayAndPast } from "~/helpers/todayAndPast";

interface Button {
  label: string;
  type: "primary" | "default";
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

const isEventTwoDaysFromNow = computed(() => {
  if (!eventConfig.startAt) return false;

  const startAt = new Date(eventConfig.startAt);
  const today = new Date();

  const twoDaysBeforeStart = new Date(startAt);
  twoDaysBeforeStart.setDate(startAt.getDate() - 2);
  const isTwoDaysBefore = twoDaysBeforeStart.getDate() === today.getDate() &&
    twoDaysBeforeStart.getMonth() === today.getMonth() &&
    twoDaysBeforeStart.getFullYear() === today.getFullYear();

  return isTwoDaysBefore;
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
  const twoDaysBefore = isEventTwoDaysFromNow.value;
  const isSchedulesEnabled = eventConfig.subscription?.enabled;
  const subscriptionsAvailable = !hasLastSubscriptionSchedulePassed.value;
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
      label: "Ajude na organização do evento",
      type: "default",
      visible: eventConfig.externalVolunteers?.enabled &&
        !twoDaysBefore,
      action: goToExternalVolunteerSubscription,
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

const groupedButtonsByType = computed((): Record<'default' | 'primary', Button[]> => {
  const groupedButtons = buttons.value.reduce((acc, button) => {
    if (!acc[button.type]) {
      acc[button.type] = [];
    }
    acc[button.type].push(button);
    return acc;
  }, {} as Record<string, Button[]>);
  return groupedButtons;
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

function goToExternalVolunteerSubscription() {
  navigateTo(`/event/${props.eventSlug}/volunteer`)
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

.button-group-wrapper>* {
  flex: 1;
}
</style>
