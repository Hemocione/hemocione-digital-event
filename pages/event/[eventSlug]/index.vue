<template>
  <div class="event-page">
    <section class="event-details">
      <ElIcon
        v-show="!eventConfig.private"
        class="arrow-left"
        @click="goToEventListPage"
      >
        <ElIconArrowLeftBold />
      </ElIcon>
      <NuxtImg
        fit="cover"
        :format="eventConfig.banner ? 'webp' : undefined"
        :src="
          eventConfig.banner ||
          '/images/illustrations/rafiki-blood-donation.svg'
        "
        class="event-banner"
        :alt="`Banner - ${eventConfig.name}`"
      />
      <div class="event-header">
        <h1 class="text-heading">
          {{ eventConfig.name }}
        </h1>
        <MicroDateBox
          v-if="eventConfig.startAt"
          :date="eventConfig.startAt"
          light
        />
      </div>
      <EventsInfo
        class="event-info"
        :address-text="addressText"
        :time-text="timeText"
        :participants="participants"
      />
      <h1 style="padding: 1rem" class="text-heading">Localização</h1>
      <GoogleMapsAddress
        v-if="addressText"
        class="map"
        :address="addressText"
      />
      <div class="map-subtitle">
        <h2 class="text-subheading">
          {{ eventConfig.name }}
        </h2>
        <span>{{ addressText }}</span>
      </div>
    </section>
    <EventsFooter
      :event-slug="eventSlug"
      :register-donation-url="eventConfig.registerDonationUrl"
    />
  </div>
</template>

<script setup lang="ts">
import { formatAddress, formatTimeDuration } from "~/helpers/formatter";

const route = useRoute();
const router = useRouter();
const eventStore = useEventStore();
const eventSlug = route.params.eventSlug as string;
const eventConfig = await eventStore.getEvent(eventSlug);
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
if (!eventConfig) goToEventListPage();

const timeText = computed(() => {
  if (!eventConfig.startAt) return "";

  return formatTimeDuration(eventConfig.startAt, eventConfig.endAt);
});

const addressText = computed(() => {
  if (!eventConfig.location) return null;

  return formatAddress(eventConfig.location);
});

const participants = computed(() => {
  if (!eventConfig.subscription?.enabled) return null;

  return eventConfig.subscription.schedules.reduce(
    (acc, schedule) => acc + schedule.occupiedSlots,
    0,
  );
});

const config = useRuntimeConfig();

// TODO: performer = banco de sangue
// REF: https://developers.google.com/search/docs/appearance/structured-data/event
useHead({
  title: `${eventConfig.name ?? eventConfig.slug}`,
});
useSchemaOrg([
  defineEvent({
    name: eventConfig.name,
    startDate: eventConfig.startAt,
    endDate: eventConfig.endAt,
    eventAttendanceMode: "OfflineEventAttendanceMode",
    eventStatus: "EventScheduled",
    location: [
      {
        "@type": "Place",
        name: eventConfig.name,
        address: {
          streetAddress: eventConfig.location?.address,
          addressLocality: eventConfig.location?.city,
          addressRegion: eventConfig.location?.state,
          addressCountry: "BR",
        },
      },
    ],
    image: [
      eventConfig.banner ??
        "https://cdn.hemocione.com.br/events/uploads/1699940076138-logo_hemocione_fb-2(1).png",
    ],
    description:
      eventConfig.description ??
      `Evento de doação de sangue do Hemocione - ${
        eventConfig.name ?? eventConfig.slug
      }`,
    organizer: {
      "@type": "Organization",
      name: "Hemocione",
      url: "https://hemocione.com.br",
      logo: "https://cdn.hemocione.com.br/events/uploads/1699940076138-logo_hemocione_fb-2(1).png",
    },
    performer: {
      "@type": "Organization",
      name: "Hemocione",
      url: "https://hemocione.com.br",
      logo: "https://cdn.hemocione.com.br/events/uploads/1699940076138-logo_hemocione_fb-2(1).png",
    },
    offers: {
      price: 0,
      priceCurrency: "BRL",
      url: `${config.public.siteUrl}/event/${eventConfig.slug}`,
      validFrom: eventConfig.startAt,
      validUntil: eventConfig.endAt,
    },
  }),
]);
useServerSeoMeta({
  title: `${eventConfig.name ?? eventConfig.slug}`,
  ogTitle: `${eventConfig.name ?? eventConfig.slug}`,
  description:
    eventConfig.description ??
    `Evento de doação de sangue do Hemocione - ${
      eventConfig.name ?? eventConfig.slug
    }`,
  ogDescription:
    eventConfig.description ??
    `Evento de doação de sangue do Hemocione - ${
      eventConfig.name ?? eventConfig.slug
    }`,
  twitterCard: "summary_large_image",
  fbAppId: "Hemocione",
  ogUrl: `${config.public.siteUrl}/event/${eventConfig.slug}`,
});

const ogImageOptions = {
  width: 800,
  height: 400,
  component: "EventDetail",
  title: `${eventConfig.name ?? eventConfig.slug}`,
  description:
    eventConfig.description ??
    `Evento de doação de sangue do Hemocione - ${
      eventConfig.name ?? eventConfig.slug
    }`,
  addressText,
  timeText,
  startAt: eventConfig.startAt,
  logo: eventConfig.logo,
};

defineOgImage(ogImageOptions);
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
  max-width: var(--hemo-page-max-width);
  min-height: calc(100dvh - var(--hemo-navbar-height));
  display: flex;
  flex-direction: column;
  background-color: white;
  color: var(--hemo-color-text-secondary);
  justify-self: center;
  position: relative;
  padding-bottom: 1rem;
}

.event-page {
  width: 100%;
  min-height: calc(100dvh - var(--hemo-navbar-height));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
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

.event-info {
  padding: 0 1rem;
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

@media (min-width: 1080px) {
  .event-details {
    border: 1px solid var(--hemo-color-border);
    box-shadow: 0.5rem 0.5rem 0.5rem rgba(33, 33, 33, 0.5);
    border-radius: 1rem !important;

    margin-bottom: 1rem;
  }

  .event-banner {
    border-radius: 1rem 1rem 0 0;
  }

  .event-page {
    padding-top: 1rem;
  }
}
</style>
