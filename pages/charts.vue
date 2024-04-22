<template>
  <div class="container">
    <div class="info">
      <div class="card logo">
        <NuxtImg
          format="webp"
          src="/images/logo-vertical-principal.png"
          alt="hemocione-logo"
          class="logo"
        />
      </div>
      <div class="card qrcode">
        <h3>Código</h3>
        <qrcode-vue class="qrcode" value="Oi oi oi" :size="300" level="H" />
      </div>
    </div>
    <div class="charts">
      <div ref="lineChart" class="card line-chart">
        <h3>Doações de sangue nas últimas 3 horas</h3>
        <ClientOnly>
          <Chart
            v-if="lineChartSeries"
            class="chart"
            type="line"
            :height="370"
            :series="lineChartSeries"
          />
        </ClientOnly>
      </div>
      <div ref="lineChart" class="card candle-chart">
        <h3>Doações de sangue nas últimas 3 horas</h3>
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
import QrcodeVue from "qrcode.vue";
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

const queueIds = eventsConfig.value
  ?.map((eventConfig) => eventConfig?.queue?._id)
  .filter((id) => id);

const sortedStartAt = eventsConfig.value
  ?.map((eventConfig) => eventConfig.startAt)
  .filter(Boolean)
  .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

if (!sortedStartAt) {
  throw new Error("No events found");
}

const { data: datasets, refresh: refreshDataSet } = await useFetch(
  "/api/v1/charts/dataset",
  {
    query: {
      queueIds,
      startedAt: sortedStartAt[0],
      endedAt: new Date().toISOString(),
      intervalMin: 60,
      datasets: "line,candlestick",
    },
  },
);

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

// const queuesIds = eventsConfig.value
//   ?.map((eventConfig) => eventConfig?.queue?._id)
//   .filter((id) => id);

// console.log(queuesIds);

// onMounted(() => {
//   fetchLineChart();
// });

// async function fetchLineChart() {
//   const { data } = await useFetch("/api/v1/charts/dataset");

//   console.log(data);
// }
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
}

.logo img {
  width: 100px;
  height: 100px;
}

.qrcode {
  grid-area: QrCode;
}

.line-chart {
  grid-area: Line;
}

.candle-chart {
  grid-area: Candle;
}
</style>
