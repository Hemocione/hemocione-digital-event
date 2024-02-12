<template>
  <CommonCoolFooter height="fit-content" desktop-border-radius="0">
    <ElButton type="primary" size="large" @click="goToSchedule">
      Confirmar
    </ElButton>
  </CommonCoolFooter>
</template>

<script setup lang="ts">
const props = defineProps({
  eventSlug: {
    type: String,
    required: true,
  },
  selectedScheduleId: {
    type: String as PropType<string | null>,
    default: null,
  },
});

function goToSchedule() {
  if (!props.selectedScheduleId) return;

  navigateTo(`/event/${props.eventSlug}/ticket`);
}
</script>

<style scoped>
button {
  height: 48px;
}
</style>
