<template>
  <div class="bloodbag-page">
    <div class="logos">
      <NuxtImg format="webp" src="/images/logo-vertical-principal.png" alt="hemocione-logo" />
      <NuxtImg v-if="eventConfig?.logo" format="webp" :src="eventConfig?.logo" alt="event-logo" class="event-logo" />
    </div>
    <div class="social-media">
      <div class="social-network">
        <NuxtImg format="webp" src="/images/social/instagram.png" alt="instagram" />
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

    <section class="additional-infos">
      <div class="wrapper-saved-lifes shadow">
        <h3 class="saved-lifes">Doações realizadas até agora:</h3>
        <h3 class="saved-lifes count">{{ totalDonations }}</h3>
      </div>

      <div class="wrapper-saved-lifes shadow">
        <h3 class="saved-lifes">Vidas salvas até agora:</h3>
        <h3 class="saved-lifes count">{{ savedLifes }}</h3>
      </div>

      <div class="know-more shadow">
        <div class="wrapper-qrcode">
          <!-- TODO: make QRCode receive parameter -->
          <HemoQrCode content="value" :size="350" />
        </div>
        <p class="know-more-text">Conheça mais sobre o Hemocione!</p>
      </div>
    </section>
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

const totalDonations = computed(() => {
  return calledParticipants.value?.length
    ? calledParticipants.value?.length
    : 0
})

const savedLifes = computed(() => {
  return calledParticipants.value?.length
    ? calledParticipants.value?.length * 4
    : 0
})

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
  padding: 3rem 9rem 3rem 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.additional-infos {
  display: grid;
  flex-direction: column;
  gap: 16px;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr 1fr;
  grid-template-areas:
    "donations lifes"
    "qrcode qrcode";
}

.wrapper-saved-lifes {
  background-color: white;
  border-radius: 32px;
  padding: 2rem;
  width: 100%;
  text-align: center;
}

.saved-lifes {
  font-size: 1.8rem;
  color: var(--hemo-color-text-secondary);
  margin: 0;
  margin-bottom: 16px;
}

.saved-lifes.count {
  font-size: 3rem;
  color: var(--hemo-color-primary);
  font-weight: 800;
  margin: 0;
}

.know-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  background-color: white;
  padding: 32px 0px;
  border-radius: 32px;
  grid-area: qrcode;
}


.know-more-text {
  color: var(--hemo-color-text-secondary);
  margin: 0;
  text-align: center;
  font-size: 2rem;
  font-weight: 600;
}

.shadow {
  box-shadow: 0px 0px 8px var(--hemo-color-text-secondary-opaque);
}
</style>