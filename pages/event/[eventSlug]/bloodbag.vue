<script setup lang="ts">
definePageMeta({
  layout: false,
});
const route = useRoute();
const eventSlug = route.params.eventSlug;
const { data: eventConfig } = await useFetch(`/api/v1/event/${eventSlug}`);
const queueId = String(eventConfig?.value?.queue?._id);
const getCalledParticipantsUrl =
  `/api/v1/event/${eventSlug}/queue/${queueId}/participant/called` as const;

const { data: calledParticipants, refresh } = await useFetch(
  getCalledParticipantsUrl,
);
const maxParticipants = eventConfig?.value?.queue?.participantsMax ?? 120;
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
    <div class="logos">
      <NuxtImg src="/images/logo-vertical-principal.png" alt="hemocione-logo" />
      <NuxtImg
        v-if="eventConfig?.logo"
        :src="eventConfig?.logo"
        alt="event-logo"
      />
    </div>
    <div class="social-media">
      <div class="social-network">
        <NuxtImg src="/images/social/instagram.png" alt="instagram" />
        <span>@hemocione</span>
      </div>
      <div class="social-network">
        <NuxtImg src="/images/social/globo.png" alt="web" />
        <span>www.hemocione.com.br</span>
      </div>
      <div class="social-network">
        <NuxtImg src="/images/social/mail.png" alt="email" />
        <span>contato@hemocione.com.br</span>
      </div>
    </div>
    <BloodBagLoader :percentage="donationPercentage" class="loader" />
    <BloodBagLatestDonators
      :latest-called-participants="calledParticipants?.slice(0, 11) || []"
      class="latest-donators"
    />
  </div>
</template>

<style scoped>
.logos {
  position: absolute;
  top: 3rem;
  left: 3rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.logos img {
  width: 10rem;
}

.social-media {
  position: absolute;
  bottom: 3rem;
  left: 3rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.social-network {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.social-network img {
  height: 2rem;
}

.social-network span {
  color: var(--hemo-color-text-secondary);
  font-size: 1.2rem;
}
.loader {
  width: 70%;
  height: 100%;
}

.latest-donators {
  width: 30% !important;
  height: 100%;
}
.bloodbag-page {
  height: 100dvh;
  width: 100%;
  background-color: var(--hemo-color-secondary);
  padding: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
