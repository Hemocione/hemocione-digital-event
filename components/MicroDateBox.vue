<template>
  <div :class="['date-wrap', light ? 'date-wrap-light' : 'date-wrap-dark']">
    <span class="month">{{ humanReadableMonth }}</span>
    <span class="day">{{ day }}</span>
  </div>
</template>

<script setup lang="ts">
const monthMinimalText = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
] as const;
const props = defineProps<{
  date: Date | string;
  light?: boolean;
}>();

const validDate = computed(() => {
  if (props.date instanceof Date) return props.date;
  return new Date(props.date);
});

const humanReadableMonth = computed(() => {
  const monthNumber = validDate.value.getMonth();
  return monthMinimalText[monthNumber];
});

const day = computed(() => validDate.value.getDate());
</script>

<style scoped>
.date-wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border-radius: 1rem;
  width: 3.5rem;
  aspect-ratio: 4/5;
  text-align: center;
}

.date-wrap-dark {
  background-color: var(--hemo-color-secondary);
  color: var(--hemo-color-primary);
}
.date-wrap-light {
  background-color: var(--hemo-color-primary);
  color: var(--hemo-color-secondary);
}

.month {
  font-size: 0.8rem;
}

.day {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
