<template>
  <div class="events-page">
    <header class="events-header">
      <h1 class="events-title">Eventos</h1>
    </header>
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="Disponíveis" name="ongoing">
        <ElInput
          v-model="searchOngoing"
          placeholder="Buscar eventos"
          clearable
          size="large"
          :prefix-icon="ElIconSearch"
          class="search-input"
        />
        <div v-if="filteredOngoingEvents?.length" class="events-wrapper">
          <EventsListCard
            v-for="event in filteredOngoingEvents"
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
                {{ noOngoingEventsText }}
              </span>
              <span class="no-events-subtext">
                Acompanhe-nos nas redes sociais e aguarde os próximos eventos.
              </span>
              <span class="no-events-subtext"> ┬─┬ノ( º _ ºノ) </span>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Encerrados" name="ended">
        <ElInput
          v-model="searchEnded"
          placeholder="Buscar eventos"
          clearable
          size="large"
          :prefix-icon="ElIconSearch"
          class="search-input"
        />
        <div v-if="!loadedOldEvents">
          <el-button type="primary" 
    icon="el-icon-loading" 
    loading 
    class="loading"></el-button>
        </div>
        <template v-else>
          <div v-if="loadedOldEvents" class="events-wrapper">
            <EventsListCard
              v-for="event in oldEvents"
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
                  Não há eventos encerrados no momento.
                </span>
              </div>
            </div>
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAsyncData } from 'nuxt/app';
import { Search as ElIconSearch } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const searchQuery = route.query.search as string || "";
const searchOngoing = ref(searchQuery);
const activeTab = ref('ongoing');

watch(searchOngoing, (newSearch) => {
  if (activeTab.value === 'ongoing') {
    router.push({ query: { search: newSearch } });
  }
});

const { data: currentEvents, refresh } = await useFetch('/api/v1/event');

const oldEvents = ref<OldEvent[]>([]);
const loadedOldEvents = ref<boolean>(false);

const fetchOldEvents = () => $fetch('/api/v1/event?old=true');

type OldEvents = Awaited<ReturnType< typeof fetchOldEvents>>
type OldEvent = OldEvents[number]

const getOldEvents = async () => {
  if (loadedOldEvents.value) return;
  try {
    oldEvents.value = await fetchOldEvents();
  } catch (error) {
    console.error("Failed to load old events:", error);
  }
  loadedOldEvents.value = true;
};

const now = new Date();

const cleanSearchOngoing = computed(() => {
  return getCleanText(searchOngoing.value);
});

const filteredOngoingEvents = computed(() => {
  if (!currentEvents.value) {
    return [];
  }
  const ongoingEvents = currentEvents.value.filter(event => {
    const eventEnd = new Date(event.endAt);
    return eventEnd >= now;
  });
  if (!cleanSearchOngoing.value) {
    return ongoingEvents;
  }
  return ongoingEvents.filter(event => {
    const eventBaseString = `${event.name}${event.location?.address || ""}${event.location?.state || ""}${event.location?.city || ""}`;
    return getCleanText(eventBaseString).includes(cleanSearchOngoing.value);
  });
});

const noOngoingEventsText = computed(() => {
  if (cleanSearchOngoing.value && filteredOngoingEvents.value.length === 0) {
    return "Nenhum evento encontrado com o termo pesquisado.";
  }
  return "Estamos sem eventos disponíveis no momento.";
});

const handleTabChange = (tab) => {
  console.log(tab);
  activeTab.value = tab;
  if (tab === 'ongoing') {
    searchOngoing.value = route.query.search as string || "";
  }
  else if (tab === 'ended'){
    getOldEvents();
  }
};

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
  margin: 1rem;
  --el-input-bg-color: var(--hemo-color-white);
  --el-border-color: var(--hemo-color-black-10);
  --el-input-text-color: var(--hemo-color-text-secondary);
  --el-input-icon-color: var(--hemo-color-text-secondary);
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
  letter-spacing: 0.1rem;
  color: var(--hemo-color-black-100);
}

.events-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  width: 100%;
  height: 100%;
  padding-bottom: 24px;
}

.no-events-image {
  width: 30%;
  padding: 1rem;
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
  background-color: var(--hemo-color-white);
  border-radius: 1rem;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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

.loading {
  color: var(--hemo-color-primary);
  background-color: var(--hemo-color-black-20);
  border-color: var(--hemo-color-black-20);
  font-size: 7rem;
  padding: 80px;
  height: 200px;
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
