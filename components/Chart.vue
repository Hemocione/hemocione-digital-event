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

const supportedTypes = ["line", "candlestick", "area"] as const;
type SupportedType = (typeof supportedTypes)[number];

const props = defineProps<{
  height: number;
  type: SupportedType;
  series: { name: string; data: Record<string, unknown>[] }[];
}>();

const exclusiveOptions: Record<SupportedType, ApexOptions> = {
  line: {
    stroke: {
      curve: "smooth",
    },
  },
  candlestick: {
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#2ac769",
          downward: "#ff6262",
        },
      },
    },
  },
  area: {
    stroke: {
      curve: "smooth",
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 100],
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#2ac769",
          downward: "#ff6262",
        },
      },
      area: {
        fillTo: "origin",
      },
    },
  },
};

const exclusiveOption = exclusiveOptions[props.type];

const options: ApexOptions = {
  colors: ["#E93C3C"],
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      formatter(value: string, _timestamp: unknown, _opts: unknown) {
        const date = new Date(value).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
        });
        return date;
      },
    },
  },
  grid: {
    show: true,
  },
  chart: {
    toolbar: {
      show: false,
    },
  },
  tooltip: {
    enabled: false,
  },
  ...exclusiveOption,
};
</script>

<style scoped>
.charts {
  width: 100%;
  height: 100%;
}
</style>
