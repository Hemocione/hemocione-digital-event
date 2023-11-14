<template>
  <div class="event-page">
    <section class="event-details">
      <ElIcon class="arrow-left" @click="goToEventListPage">
        <ElIconArrowLeftBold />
      </ElIcon>
      <NuxtImg
        fit="inside"
        :src="
          eventConfig?.banner ||
          '/images/illustrations/rafiki-blood-donation.svg'
        "
        class="event-banner"
      />
      <div class="event-header">
        <h1>
          {{ eventConfig?.name }}
        </h1>
        <MicroDateBox
          v-if="eventConfig?.startAt"
          :date="eventConfig?.startAt"
          light
        />
      </div>
      <div class="event-content">
        <div v-if="timeText" class="event-extra-info">
          <ElIcon class="icon">
            <ElIconCalendar />
          </ElIcon>
          <span class="extra-info-text">
            {{ timeText }}
          </span>
        </div>
        <div v-if="addressText" class="event-extra-info">
          <ElIcon class="icon">
            <ElIconLocation />
          </ElIcon>
          <span class="extra-info-text">
            {{ addressText }}
          </span>
        </div>
        <h1 style="margin: 0; padding-top: 1rem">Localização</h1>
        <GoogleMapsAddress
          v-if="addressText"
          class="map"
          :address="addressText"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const eventSlug = route.params.eventSlug;
const { data: eventConfig } = await useFetch(`/api/v1/event/${eventSlug}`);
definePageMeta({
  name: "EventPage",
  scrollToTop: true,
  middleware(to, from) {
    if (from.name === "EventsListPage") {
      to.meta.pageTransition = {
        name: "slide-left",
        mode: "out-in",
        appear: true,
      };
      from.meta.pageTransition = {
        name: "slide-left",
        mode: "in-out",
        appear: true,
      };
    }
  },
});

const goToEventListPage = () => {
  router.push("/");
};
if (!eventConfig.value) goToEventListPage();

const timeText = computed(() => {
  if (!eventConfig.value?.startAt) return "";
  const startAt = new Date(eventConfig.value.startAt);
  const endAt = new Date(eventConfig.value.endAt);
  const sameDay = startAt.getDate() === endAt.getDate();

  const startAtText = startAt.toLocaleString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

  const endAtText = sameDay
    ? endAt.toLocaleString("pt-BR", {
        hour: "numeric",
        minute: "numeric",
      })
    : endAt.toLocaleString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
  return `${startAtText} - ${endAtText}`;
});

const addressText = computed(() => {
  if (!eventConfig.value?.location) return null;

  const { address, city, state } = eventConfig.value.location;
  return `${address} - ${city}, ${state}`;
});

useHead({
  title: `${
    eventConfig.value?.name ?? eventConfig.value?.slug
  } | Hemocione Eventos`,
});
useServerSeoMeta({
  title: `${
    eventConfig.value?.name ?? eventConfig.value?.slug
  } | Hemocione Eventos`,
  ogTitle: `${
    eventConfig.value?.name ?? eventConfig.value?.slug
  } | Hemocione Eventos`,
  description:
    eventConfig.value?.description ?? `Evento de doação de sangue do Hemocione`,
  ogDescription:
    eventConfig.value?.description ?? `Evento de doação de sangue do Hemocione`,
  ogImage:
    eventConfig.value?.banner ??
    "https://cdn.discordapp.com/attachments/757012940804194367/1150223307472384122/Horizontal-Cor-FP.png",
  twitterCard: "summary_large_image",
});
</script>

<style scoped>
.map {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 1rem;
}
.arrow-left {
  position: absolute;
  top: 1rem;
  left: 1rem;
  color: var(--hemo-color-text-secondary);
  font-size: 1.5rem;
  background-color: var(--hemo-color-secondary);
  box-shadow: 0 0 1rem rgba(33, 33, 33, 0.2);
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
}

.arrow-left:hover {
  cursor: pointer;
  box-shadow: 0 0 1rem rgba(33, 33, 33, 0.4);
}
.event-details {
  width: 100%;
  max-width: 1080px;
  min-height: 93dvh;
  display: flex;
  flex-direction: column;
  background-color: var(--hemo-color-secondary);
  color: var(--hemo-color-text-secondary);
  justify-self: center;
  position: relative;
}

.event-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  width: 100%;
}
.event-extra-info {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.5rem;
}

.extra-info-text {
  font-size: 1rem;
}

.event-page {
  width: 100%;
  min-height: 93dvh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-banner {
  width: 100%;
  aspect-ratio: 2/1;
}

.event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  gap: 1rem;
}

.event-header h1 {
  margin: 0;
  max-width: 80%;
  font-size: 2rem;
}

.icon {
  width: 10%;
  max-width: 2rem;
  color: var(--hemo-color-primary);
  font-size: 2rem;
}

@media (min-width: 1080px) {
  .event-details {
    border: 1px solid var(--hemo-color-border);
    box-shadow: 0 0 1rem rgba(33, 33, 33, 0.2);
    border-radius: 1rem;
  }
}
</style>
