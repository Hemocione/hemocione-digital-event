<template>
  <CommonCoolFooter height="fit-content">
    <ElButton type="primary" size="large" @click="goToSchedule">
      Agendar horário
    </ElButton>
  </CommonCoolFooter>
</template>

<script setup lang="ts">
const props = defineProps({
  eventSlug: {
    type: String,
    required: true,
  },
});

function goToSchedule() {
  navigateTo(`/event/${props.eventSlug}/schedules`);
}
</script>

<style scoped>
button {
  height: 48px;
}
</style>
