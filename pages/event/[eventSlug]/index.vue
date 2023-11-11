<template>
  <section class="event-details">
    <NuxtImg
      fit="inside"
      :src="
        eventConfig?.banner || '/images/illustrations/rafiki-blood-donation.svg'
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
  </section>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const eventSlug = route.params.eventSlug;
const { data: eventConfig } = await useFetch(`/api/v1/event/${eventSlug}`);
definePageMeta({
  name: "EventPage",
  scrollToTop: true,
  useWholePage: true,
  pageTransition: {
    name: "slide-fade-left",
    mode: "out-in",
    appear: true,
  },
  middleware(to, from) {
    if (from.path === "/") {
      to.meta.pageTransition = {
        name: "slide-fade-left",
        mode: "out-in",
        appear: true,
      };
      from.meta.pageTransition = {
        name: "slide-fade-left",
        mode: "in-out",
        appear: true,
      };
    }
  },
});

if (!eventConfig.value) {
  router.push("/");
}

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
.event-details {
  width: 100%;
  min-height: 93dvh;
  display: flex;
  flex-direction: column;
  background-color: var(--hemo-color-secondary);
  color: var(--hemo-color-text-secondary);
}

.event-banner {
  width: 100%;
  aspect-ratio: 28/15;
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
}
</style>
