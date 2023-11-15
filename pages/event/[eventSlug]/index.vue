<template>
  <div class="event-page">
    <section class="event-details">
      <ElIcon class="arrow-left" @click="goToEventListPage">
        <ElIconArrowLeftBold />
      </ElIcon>
      <NuxtImg
        fit="inside"
        :format="eventConfig?.banner ? 'webp' : undefined"
        :src="
          eventConfig?.banner ||
          '/images/illustrations/rafiki-blood-donation.svg'
        "
        class="event-banner"
        :alt="`Banner - ${eventConfig?.name}`"
      />
      <div class="event-header">
        <h1 class="text-heading">
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
      </div>
      <h1 style="padding: 1rem" class="text-heading">Localização</h1>
      <GoogleMapsAddress
        v-if="addressText"
        class="map"
        :address="addressText"
      />
      <div class="map-subtitle">
        <h2 class="text-subheading">
          {{ eventConfig?.name }}
        </h2>
        <span>{{ addressText }}</span>
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

// TODO: performer = banco de sangue
// REF: https://developers.google.com/search/docs/appearance/structured-data/event
useHead({
  title: `${
    eventConfig.value?.name ?? eventConfig.value?.slug
  } | Hemocione Eventos`,
});
useSchemaOrg([
  defineEvent({
    name: eventConfig.value?.name,
    startDate: eventConfig.value?.startAt,
    endDate: eventConfig.value?.endAt,
    eventAttendanceMode: "OfflineEventAttendanceMode",
    eventStatus: "EventScheduled",
    location: [
      {
        "@type": "Place",
        name: eventConfig.value?.name,
        address: {
          streetAddress: eventConfig.value?.location?.address,
          addressLocality: eventConfig.value?.location?.city,
          addressRegion: eventConfig.value?.location?.state,
          addressCountry: "BR",
        },
      },
    ],
    image: [
      eventConfig.value?.banner ??
        "https://cdn.hemocione.com.br/events/uploads/1699940076138-logo_hemocione_fb-2(1).png",
    ],
    description:
      eventConfig.value?.description ??
      `Evento de doação de sangue do Hemocione - ${
        eventConfig.value?.name ?? eventConfig.value?.slug
      }`,
    organizer: {
      "@type": "Organization",
      name: "Hemocione",
      url: "https://hemocione.com.br",
      logo: "https://cdn.hemocione.com.br/events/uploads/1699940076138-logo_hemocione_fb-2(1).png",
    },
    offers: {
      price: 0,
      priceCurrency: "BRL",
      url: `https://eventos.hemocione.com.br/event/${eventConfig.value?.slug}`,
      validFrom: eventConfig.value?.startAt,
      validUntil: eventConfig.value?.endAt,
    },
  }),
]);
useServerSeoMeta({
  title: `${
    eventConfig.value?.name ?? eventConfig.value?.slug
  } | Hemocione Eventos`,
  ogTitle: `${
    eventConfig.value?.name ?? eventConfig.value?.slug
  } | Hemocione Eventos`,
  description:
    eventConfig.value?.description ??
    `Evento de doação de sangue do Hemocione - ${
      eventConfig.value?.name ?? eventConfig.value?.slug
    }`,
  ogDescription:
    eventConfig.value?.description ??
    `Evento de doação de sangue do Hemocione - ${
      eventConfig.value?.name ?? eventConfig.value?.slug
    }`,
  ogImage:
    eventConfig.value?.banner ??
    "https://cdn.hemocione.com.br/events/uploads/1699940076138-logo_hemocione_fb-2(1).png",
  twitterCard: "summary_large_image",
});
</script>

<style scoped>
.map {
  max-width: 100%;
  aspect-ratio: 2/1;
}

.map-subtitle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.5rem;
  padding: 1rem;
  width: 100%;
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
  padding-bottom: 1rem;
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

.text-heading {
  margin: 0;
  max-width: 80%;
  font-size: 2rem;
}

.text-subheading {
  margin: 0;
  padding: 0;
  font-size: 1.5rem;
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
    box-shadow: 0.5rem 0.5rem 0.5rem rgba(33, 33, 33, 0.5);
    border-radius: 1rem !important;
  }

  .event-banner {
    border-radius: 1rem 1rem 0 0;
  }

  .event-page {
    padding-bottom: 1rem;
  }
}
</style>
