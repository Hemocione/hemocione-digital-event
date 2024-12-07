<template>
  <div
    class="bloodbag-page"
    :style="hideQrCode ? 'justify-content: center' : ''"
  >
    <div class="social-media" v-if="layout === 'horizontal'">
      <div class="social-network">
        <NuxtImg src="/images/social/instagram.png" alt="instagram" />
        <span>@hemocione</span>
      </div>
      <div class="social-network">
        <NuxtImg src="/images/social/globo.png" alt="web" />
        <span>www.hemocione.com.br</span>
      </div>
    </div>
    <BloodBagLoader
      :percentage="donationPercentage"
      class="loader"
      :class="layout"
    >
      <span class="counter" v-if="counterRef">{{ counterRef }}</span>
    </BloodBagLoader>

    <section class="additional-infos" :class="layout">
      <div class="logos">
        <NuxtImg
          src="/images/logo-hemocione-principal.svg"
          alt="hemocione-logo"
          @click="increment"
        />
        <NuxtImg
          v-if="eventConfig?.logo"
          format="webp"
          :src="eventConfig?.logo"
          alt="event-logo"
          class="event-logo"
          @click="decrement"
        />
      </div>
      <div class="know-more shadow" v-if="!hideQrCode">
        <div class="wrapper-qrcode">
          <!-- TODO: make QRCode receive parameter -->
          <HemoQrCode
            content="https://www.instagram.com/hemocione/"
            :size="350"
          />
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
const router = useRouter();
const { hideQrCode, counter } = route.query;
const eventsParams = route.query.events as string;
const eventSlugs = eventsParams.split(",");
const layouts = ["horizontal", "vertical"] as const;
type Layout = (typeof layouts)[number];

const defaultLayout = layouts.includes(String(route.query.layout) as Layout)
  ? (route.query.layout as Layout)
  : "horizontal";
const layout = ref<Layout>(defaultLayout);

const { data: eventsConfig } = await useFetch(`/api/v1/event/search`, {
  params: { eventSlugs: _.castArray(eventSlugs) },
});
// TODO: treat multiple events
const eventConfig = eventsConfig.value?.[0];
if (!eventConfig) {
  throw new Error("Event not found");
}

const timeAtStart = new Date(eventConfig.startAt).getTime();
const timeAtEnd = new Date(eventConfig.endAt).getTime();
const totalTime = timeAtEnd - timeAtStart;

const getTimeElapsed = () => {
  const timeElapsedSinceStart = new Date().getTime() - timeAtStart;
  return Math.min(timeElapsedSinceStart, totalTime);
};

const timeElapsedSinceStart = ref(getTimeElapsed());
const initialCounter = Number(counter) || 0;
const counterRef = ref(initialCounter);

const donationPercentageTime = computed(() =>
  Math.min((timeElapsedSinceStart.value / totalTime) * 100, 100),
);

const donationPercentageCounter = computed(() =>
  Math.min(
    (counterRef.value / (eventConfig.queue?.participantsMax || 600)) * 100,
    100,
  ),
);

const donationPercentage = computed(() =>
  Math.max(donationPercentageTime.value, donationPercentageCounter.value),
);

onMounted(() => {
  setInterval(() => {
    timeElapsedSinceStart.value = getTimeElapsed();
  }, 10000);
});

const increment = () => {
  counterRef.value++;
};

const decrement = () => {
  if (counterRef.value === 0) return;
  counterRef.value--;
};

watch(
  () => counterRef.value,
  (value) => {
    router.replace({
      query: {
        ...route.query,
        counter: value,
      },
    });
  },
);
</script>

<style scoped>
.logos {
  z-index: 1000;
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  padding-bottom: 2rem;
  gap: 4rem;
}

.logos img {
  width: 50%;
  object-fit: contain;
}

.social-media {
  position: absolute;
  bottom: 3rem;
  right: 3rem;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  gap: 1rem;
}

.social-media-vertical {
  position: absolute;
  top: 50%;
  right: -5rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  rotate: 90deg;
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

.vertical {
  rotate: 90deg;
}

.bloodbag-page {
  height: 100dvh;
  width: 100%;
  background-color: var(--hemo-color-secondary);
  padding: 3rem 9rem 3rem 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.additional-infos {
  display: grid;
  flex-direction: column;
  gap: 16px;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;
  grid-template-areas:
    "donations lifes"
    "qrcode qrcode";
  max-width: 50%;
}

.wrapper-saved-lifes {
  background-color: white;
  border-radius: 32px;
  padding: 2rem;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.saved-lifes {
  font-size: 1.8rem;
  color: var(--hemo-color-text-secondary);
  margin: 0;
  margin-bottom: 16px;
}

.saved-lifes.count {
  font-size: 5rem;
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

.counter {
  font-size: 7rem;
  color: var(--hemo-color-secondary); /* Cor de preenchimento */
  font-weight: 800;
  position: absolute;
  top: 50%;
  z-index: 999999;
  -webkit-text-stroke: 1px var(--hemo-color-primary); /* Borda branca ao redor do texto */
  text-stroke: 1px var(--hemo-color-primary); /* Fallback para navegadores compatíveis com text-stroke */
  text-fill-color: var(
    --hemo-color-primary
  ); /* Para compatibilidade com text-fill */
}
</style>
