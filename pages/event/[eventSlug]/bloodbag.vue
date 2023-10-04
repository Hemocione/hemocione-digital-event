<script setup lang="ts">
const route = useRoute();
const eventSlug = route.params.eventSlug;
const { data: eventConfig } = await useFetch(`/api/v1/event/${eventSlug}`);
const queueId = String(eventConfig?.value?.queue?._id);
const getCalledParticipantsUrl =
  `/api/v1/event/${eventSlug}/queue/${queueId}/participant/called` as const;

const { data: calledParticipants, refresh } = await useFetch(
  getCalledParticipantsUrl,
);
const maxParticipants = 120; // TODO: get from eventConfig
const numberOfCalledParticipants = computed(
  () => calledParticipants?.value?.length || 0,
);
const donationPercentage = computed(() =>
  Math.min((numberOfCalledParticipants.value / maxParticipants) * 100, 100),
);

onMounted(() => {
  setInterval(() => {
    refresh();
  }, 10000);
});
</script>

<template>
  <div class="bloodbag-page">
    <BloodBagLoader :percentage="donationPercentage" class="loader" />
    <BloodBagLatestDonators
      :latest-called-participants="calledParticipants?.slice(0, 11) || []"
      class="latest-donators"
    />
  </div>
</template>

<style scoped>
.loader {
  width: 70%;
  height: 100%;
}

.latest-donators {
  width: 30%;
  height: 100%;
}
.bloodbag-page {
  height: 100%;
  background-color: var(--hemo-color-secondary);
  padding: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
