<template>
  <div class="bloodbag-page">
    <div class="logos">
      <NuxtImg
        format="webp"
        src="/images/logo-vertical-principal.png"
        alt="hemocione-logo"
      />
      <NuxtImg
        v-if="eventConfig?.logo"
        format="webp"
        :src="eventConfig?.logo"
        alt="event-logo"
        class="event-logo"
      />
    </div>
    <div class="social-media">
      <div class="social-network">
        <NuxtImg
          format="webp"
          src="/images/social/instagram.png"
          alt="instagram"
        />
        <span>@hemocione</span>
      </div>
      <div class="social-network">
        <NuxtImg format="webp" src="/images/social/globo.png" alt="web" />
        <span>www.hemocione.com.br</span>
      </div>
      <div class="social-network">
        <NuxtImg format="webp" src="/images/social/mail.png" alt="email" />
        <span>contato@hemocione.com.br</span>
      </div>
    </div>
    <BloodBagLoader :percentage="donationPercentage" class="loader" />
    <!-- TODO: add QRcode -->
  </div>
</template>

<script setup lang="ts">
import _ from "lodash";

definePageMeta({
  layout: false,
});
const route = useRoute();
const eventsParams = route.query.events as string;
const eventSlugs = eventsParams.split(",");

const { data: eventsConfig } = await useFetch(`/api/v1/event/search`, {
  params: { eventSlugs: _.castArray(eventSlugs) },
});

const queuesIds = eventsConfig.value
  ?.map((eventConfig) => eventConfig?.queue?._id)
  .filter((id) => id);

const { data: calledParticipants, refresh } = await useFetch(
  `/api/v1/queue/search`,
  {
    params: { queueParticipationIds: _.castArray(queuesIds) },
  }
);

const maxParticipants =
  eventsConfig.value?.reduce(
    (acc, curr) => curr?.queue?.participantsMax ?? 120,
    0
  ) ?? 1;

const numberOfCalledParticipants = computed(
  () => calledParticipants?.value?.length || 0
);

const donationPercentage = computed(() =>
  Math.min((numberOfCalledParticipants.value / maxParticipants) * 100, 100)
);

onMounted(() => {
  setInterval(() => {
    refresh();
  }, 10000);
});
</script>

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

  .event-logo {
    border-radius: 25%;
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
