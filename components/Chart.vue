<template>
  <VueApexCharts
    class="charts"
    type="line"
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
const series = [
  { name: "series-1", data: [30, 40, 35, 50, 49, 60, 70, 91, 125] },
];
</script>

<style scoped>
.charts {
  width: 100%;
  height: 100%;
}
</style>
