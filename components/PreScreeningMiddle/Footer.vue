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
});

const eventStore = useEventStore();
const userStore = useUserStore();
const subscription = await userStore.getSubscription(props.eventSlug);
const eventConfig = await eventStore.getEvent(props.eventSlug);

interface Button {
  label: string;
  type: "primary" | "default";
  disabled?: boolean;
  visible: boolean;
  action?: () => void;
}

const loading = ref(false);

const isCanDonateOn = computed(() => {
  const config = eventConfig?.preScreening;
  return config && !config.disabled;
});

const isCanDonateMandatory = computed(() => {
  const config = eventConfig?.preScreening;
  return config && !config.disabled && config.mandatory;
});

const buttons = computed((): Button[] => {
return [
  {
    label: "Pular questionário",
    type: "default",
    disabled: Boolean(isCanDonateMandatory.value),
    visible: Boolean(isCanDonateOn.value),
    action: goToSchedule,
  },
  {
    label: "Continuar",
    type: "primary",
    disabled: false,
    visible: Boolean(isCanDonateOn.value),
    action: () => goToCanDonate("event-flow-schedule"),
  },
] as const;
});

function goToSchedule() {
  navigateTo(`/event/${props.eventSlug}/schedules`);
}

function goToCanDonate(slugType: "event-flow-schedule" | "event-ticket-adhoc") {
  const baseUrl = "https://possodoar.hemocione.com.br/integration";
  const eventDate = eventConfig.startAt?.split("T")[0] ?? "";
  const url = `${baseUrl}/${slugType}?date=${encodeURIComponent(eventDate)}&eventSlug=${props.eventSlug}`;
  navigateTo(url, { external: true });
}
</script>

<style scoped>
button {
  height: 45px;
  margin: 0;
  text-align: center;
}
</style>
