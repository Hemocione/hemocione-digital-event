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
const maxParticipants = 120;
const numberOfCalledParticipants = computed(
  () => calledParticipants?.value?.length || 0,
);
const donationPercentage = computed(() =>
  Math.min((numberOfCalledParticipants.value / maxParticipants) * 100, 100),
);

const bloodbag = ref<HTMLImageElement | null>(null);

onMounted(() => {
  setInterval(() => {
    refresh();
  }, 10000);
});
</script>

<template>
  <div class="bloodbag-page">
    <div class="bloodbag-wrapper">
      <img
        src="/images/bloodbag-reverse.svg"
        alt="bloodbag-reversed-background"
        class="bloodbag-background"
      />
      <img
        ref="bloodbag"
        src="/images/bloodbag-fillable.svg"
        alt="bloodbag"
        class="bloodbag"
      />
      <div
        v-if="bloodbag?.clientWidth"
        class="bloodbag-wave-wrapper"
        :percentage="donationPercentage"
        :style="`--bloodBagWidth: ${bloodbag?.clientWidth}px; --percentage: ${donationPercentage}%`"
      >
        <AnimatedWave />
        <div class="rectangle" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bloodbag-page {
  height: 100%;
  background-color: var(--hemo-color-secondary);
  padding: 5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.bloodbag-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: relative;
}

.bloodbag-wrapper img {
  position: absolute;
  top: 0;
  height: 100%;
}

.bloodbag {
  z-index: 2;
}
.rectangle {
  background-color: var(--hemo-color-primary);
  width: 100%;
  height: max(var(--percentage), 5%);
}

.bloodbag-wave-wrapper {
  position: absolute;
  bottom: 0;
  z-index: 0;
  width: calc(var(--bloodBagWidth) - 6px);
  height: 100%;
  padding: 3px 0;
  overflow: hidden;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  flex-direction: column;
}

.bloodbag-background {
  z-index: 1;
}
</style>
