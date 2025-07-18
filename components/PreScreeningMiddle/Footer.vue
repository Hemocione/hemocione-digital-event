<template>
  <CommonCoolFooter v-if="visibleButtons.length" height="fit-content">
    <ElButton
      v-for="button in visibleButtons"
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
import { goToCanDonate } from "~/utils/goToCanDonate";

const props = defineProps({
  eventSlug: {
    type: String,
    required: true,
  },
});

const eventStore = useEventStore();
const userStore = useUserStore();
const eventConfig = await eventStore.getEvent(props.eventSlug);

interface Button {
  label: string;
  type: "primary" | "default";
  disabled?: boolean;
  visible: boolean;
  action?: () => void;
}

const isCanDonateOn = computed(() => {
  return eventConfig?.preScreening?.disabled !== true;
});

const isCanDonateMandatory = computed(() => {
  return eventConfig?.preScreening?.mandatory === true;
});

const buttons = computed((): Button[] => [
  {
    label: "Pular questionário",
    type: "default",
    visible: isCanDonateOn.value && !isCanDonateMandatory.value,
    action: goToSchedule,
  },
  {
    label: "Continuar",
    type: "primary",
    disabled: false,
    visible: isCanDonateOn.value,
    action: () =>
      goToCanDonate("event-flow-schedule", props.eventSlug, eventConfig?.startAt),
  },
]);

const visibleButtons = computed(() =>
  buttons.value.filter((btn) => btn.visible)
);

function goToSchedule() {
  navigateTo(`/event/${props.eventSlug}/schedules`);
}
</script>

<style scoped>
button {
  height: 45px;
  margin: 0;
  text-align: center;
}
</style>
