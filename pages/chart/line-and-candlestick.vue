<template>
  <div class="container">
    <div class="info">
      <div class="card logo">
        <NuxtImg
          src="/images/hemocione-logo-horizontal.svg"
          alt="hemocione-logo"
          class="logo"
        />
      </div>
      <div class="card qrcode">
        <HemoQrCode
          content="https://www.instagram.com/hemocione/"
          :size="350"
        />
        <span> Conheça mais sobre o Hemocione! </span>
      </div>
      <img
        v-if="eventConfig?.logo"
        :src="eventConfig?.logo"
        alt="event-logo"
        class="event-logo"
      />
    </div>
    <div class="charts">
      <div ref="lineChart" class="card line-chart">
        <h3>Doações de Sangue ao Longo do tempo</h3>
        <ClientOnly>
          <Chart
            v-if="lineChartSeries"
            class="chart"
            type="area"
            :height="370"
            :series="lineChartSeries"
          />
        </ClientOnly>
      </div>
      <div ref="candleChart" class="card candle-chart">
        <h3>Tendências de doação de sangue</h3>
        <ClientOnly>
          <Chart
            v-if="candleStickSeries"
            class="chart"
            type="candlestick"
            :height="370"
            :series="candleStickSeries"
          />
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
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

const eventConfig = eventsConfig.value?.[0];

const queueIds = eventsConfig.value
  ?.map((eventConfig) => eventConfig?.queue?._id)
  .filter((id) => id);

const sortedStartAt = eventsConfig.value
  ?.map((eventConfig) => eventConfig.startAt)
  .filter(Boolean)
  .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

const sortedEndAt = eventsConfig.value
  ?.map((eventConfig) => eventConfig.endAt)
  .filter(Boolean)
  .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

const firstStartedAt = sortedStartAt?.[0];
const lastEndedAt = sortedEndAt?.[sortedEndAt.length - 1];

if (!firstStartedAt || !lastEndedAt) {
  throw new Error("No valid events found");
}

const getChartEndDate = () => {
  const lastEventEndDate = new Date(lastEndedAt);
  const now = new Date();

  return lastEventEndDate > now ? now : lastEventEndDate;
};

const chartEndDate = ref(getChartEndDate());

const { data: datasets, refresh } = await useFetch("/api/v1/charts/dataset", {
  query: {
    queueIds,
    startedAt: sortedStartAt[0].toString(),
    endedAt: chartEndDate.value.toISOString(),
    intervalMin: 20,
    datasets: "line,candlestick",
  },
});

function refreshData() {
  chartEndDate.value = getChartEndDate();
  refresh();
}

const candleStickSeries = computed(() => {
  if (!datasets?.value?.candlestick) {
    return null;
  }

  const data = datasets.value.candlestick.map((data) => ({
    x: new Date(data.timestamp),
    y: [data.open, data.high, data.low, data.close],
  }));

  return [
    {
      name: "Candlestick",
      data,
    },
  ];
});

const lineChartSeries = computed(() => {
  if (!datasets?.value?.line) {
    return null;
  }

  return [
    {
      name: "Line",
      data: datasets.value.line,
    },
  ];
});

const REFRESH_INTERVAL = 60000;

onMounted(() => {
  setInterval(async () => {
    await refreshData();
  }, REFRESH_INTERVAL);
});
</script>

<style scoped>
.container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #e8e8e8;
  padding: 24px;
  display: flex;
  gap: 24px;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.charts {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 24px;
}

.card {
  background-color: white;
  border-radius: 24px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.card h3 {
  width: 100%;
  text-align: start;
  margin: 0;
  color: var(--hemo-color-text-secondary);
}

.logo {
  grid-area: Logo;
  object-fit: contain;
  height: fit-content;
  width: 100%;
}

.qrcode {
  grid-area: QrCode;
}

.qrcode span {
  font-size: 1.5rem;
  font-weight: 800;
  text-align: center;
  width: 100%;
  color: var(--hemo-color-text-secondary);
}

.line-chart {
  grid-area: Line;
}

.candle-chart {
  grid-area: Candle;
}

.card h3 {
  color: var(--hemo-color-text-secondary);
  font-size: 1.5rem;
  font-weight: 900;
  text-align: center;
}

.event-logo {
  width: 250px;
  aspect-ratio: 1;
  border-radius: 24px;
}
</style>
