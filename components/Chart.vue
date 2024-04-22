<template>
  <VueApexCharts
    class="charts"
    :type="type"
    :height="height"
    :options="options"
    :series="series"
  />
</template>

<script setup lang="ts">
import type { ApexOptions } from "apexcharts";
import VueApexCharts from "vue3-apexcharts";

defineProps<{
  height: number;
  type: "line" | "candlestick";
  series: { name: string; data: Record<string, unknown>[] }[];
}>();

const { data: locale } = await useFetch(
  "https://cdn.jsdelivr.net/npm/apexcharts/dist/locales/pt.json",
);

const options: ApexOptions = {
  colors: ["#E93C3C"],
  xaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      formatter(value, _timestamp, _opts) {
        const date = new Date(value)
          .toLocaleTimeString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
          .replace(", ", " - ");
        return date;
      },
    },
  },
  grid: {
    show: false,
  },
  chart: {
    toolbar: {
      show: false,
    },
    locales: [locale.value as ApexLocale],
    defaultLocale: "pt",
  },
  tooltip: {
    enabled: false,
  },
};
</script>

<style scoped>
.charts {
  width: 100%;
  height: 100%;
}
</style>
