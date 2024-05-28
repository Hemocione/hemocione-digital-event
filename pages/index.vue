<template>
  <div class="events-page">
    <header class="events-header">
      <h1 class="events-title">Eventos</h1>
      <ElInput
        v-model="search"
        placeholder="Pesquisar eventos"
        clearable
        size="large"
        :prefix-icon="ElIconSearch"
        class="search-input"
      />
    </header>
    <div v-if="filteredEvents?.length" class="events-wrapper">
      <!-- TODO: add transition group here -->
      <EventsListCard
        v-for="event in filteredEvents"
        :key="event._id"
        :name="event.name"
        :event-date="event.startAt"
        :location="event.location"
        :banner="event.banner"
        :slug="event.slug"
      />
    </div>
    <div v-else class="no-events-wrapper">
      <div class="no-events-content">
        <NuxtImg
          class="no-events-image"
          src="/images/illustrations/HemoLogo-triste.svg"
          alt="Ilustração da logo do Hemocione triste"
        />
        <div class="subtitle">
          <span class="no-events-text big-boy">(╯°□°)╯︵ ┻━┻</span>
          <span class="no-events-text">
            {{ noEventsText }}
          </span>
          <span class="no-events-subtext">
            Acompanhe-nos nas redes sociais e aguarde os próximos eventos.
          </span>
          <span class="no-events-subtext"> ┬─┬ノ( º _ ºノ) </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const searchQuery = route.query.search;
const search = ref(String(searchQuery || ""));

watch(search, () => {
  router.push({ query: { search: search.value } });
});
const { data: currentEvents } = await useFetch("/api/v1/event");

const cleanSearch = computed(() => {
  return getCleanText(search.value);
});

const filteredEvents = computed(() => {
  if (!cleanSearch.value) {
    return currentEvents.value;
  }
  return currentEvents.value?.filter((event) => {
    const eventBaseString = `${event.name}${event?.location?.address || ""}${event.location?.state || ""}${event.location?.city || ""}`;
    return getCleanText(eventBaseString).includes(cleanSearch.value)
  });
});

const noEventsText = computed(() => {
  if (cleanSearch.value && currentEvents.value?.length) {
    return "Nenhum evento encontrado com o termo pesquisado.";
  }
  return "Estamos sem eventos disponíveis no momento.";
});

definePageMeta({
  name: "EventsListPage",
  middleware(_to, from) {
    if (from.name === "EventPage") {
      from.meta.pageTransition = {
        name: "slide-right",
        mode: "out-in",
        appear: true,
      };
    }
  },
});
</script>

<style scoped>

.events-page {
  padding: 1rem;
}

.search-input {
  width: 100%;
  max-width: 300px;
  margin-bottom: 1rem;
  --el-input-bg-color: var( --hemo-color-gray);
  --el-border-color: var(--hemo-color-black-10);
  --el-input-text-color: var(--hemo-color-text-primary);
  --el-input-icon-color: var(--hemo-color-text-primary);
  border: none;
}
.events-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  padding-bottom: 1rem;
}
.events-title {
  margin: 0;
  padding: 0;
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: 0.15rem;
  color: var(--hemo-color-black-100);
}
/* this will be a grid */
.events-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  width: 100%;
  height: 100%;
  padding-bottom: 24px;
}

.no-events-image {
  width: 80%;
  padding-bottom: 1rem;
}
.no-events-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hemo-color-text-secondary);
}

.no-events-content {
  max-width: 500px;
  display: flex;
  background-color: var(--hemo-color-secondary);
  border-radius: 1rem;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.subtitle {
  margin: 0;
  padding: 0 2rem 2rem 2rem;
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.no-events-text {
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
}

.no-events-subtext {
  font-size: 0.9rem;
  text-align: center;
}

.big-boy {
  font-size: 2rem;
}
@media (min-width: 768px) {
  .events-wrapper {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 992px) {
  .events-title {
    font-size: 3rem;
  }
  .events-wrapper {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media (min-width: 1600px) {
  .events-wrapper {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  }
}
</style>
