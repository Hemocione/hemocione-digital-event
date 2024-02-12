<template>
  <CommonCoolFooter height="fit-content">
    <ElButton
      v-if="registerDonationUrl"
      size="large"
      @click="goToRegisterDonation"
    >
      Registrar Doação
    </ElButton>
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
  registerDonationUrl: {
    type: String,
    required: false,
  },
});

function goToSchedule() {
  navigateTo(`/event/${props.eventSlug}/schedules`);
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
