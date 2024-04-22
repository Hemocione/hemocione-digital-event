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

const options: ApexOptions = {
  colors: ["#E93C3C"],
  xaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  grid: {
    show: false,
  },
  chart: {
    toolbar: {
      show: false,
    },
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
