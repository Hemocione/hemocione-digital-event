<template>
  <div class="event-card">
    <NuxtImg
      fit="inside"
      :src="banner || '/images/illustrations/rafiki-blood-donation.svg'"
      :class="banner ? 'card-header-image' : 'card-header-image-default'"
    />
    <h2 class="event-name">
      {{ name }}
    </h2>
    <div v-if="addressText" class="address">
      <el-icon class="icon">
        <ElIconLocationFilled />
      </el-icon>
      <span>
        {{ addressText }}
      </span>
    </div>
    <div class="bottom-wrapper">
      <div class="date-wrap">
        <span class="month">{{ humanReadableMonth }}</span>
        <span class="day">{{ day }}</span>
      </div>
      <!-- UNCOMMENT WHEN CLICKABLE -->
      <!-- <el-icon class="arrow-icon">
        <ElIconArrowRightBold />
      </el-icon> -->
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  banner?: string | null;
  name: string;
  location?: {
    address: string;
    city: string;
    state: string;
  };
  eventDate: string;
}>();

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

const addressText = computed(() => {
  if (!props.location) return null;
  const { address, city, state } = props.location;
  return `${address} - ${city}, ${state}`;
});

const eventDateAsDate = computed(() => new Date(props.eventDate));

const humanReadableMonth = computed(() => {
  const monthNumber = eventDateAsDate.value.getMonth();
  return monthMinimalText[monthNumber];
});

const day = computed(() => eventDateAsDate.value.getDate());
</script>

<style scoped>
.card-header-image,
.card-header-image-default {
  width: 100%;
  aspect-ratio: 28/15;
  border-radius: 0.5rem;
}

.card-header-image-default {
  background-color: var(--hemo-color-secondary);
}

.arrow-icon {
  font-size: 2rem;
}

.icon {
  color: var(--hemo-color-primary-light);
  padding-bottom: 0.1rem;
  height: fit-content;
}

.event-name {
  margin: 0;
  padding-top: 1rem;
  font-size: 1.1rem;
}

.address {
  padding-top: 1rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.bottom-wrapper {
  padding-top: 1rem;
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.date-wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  background-color: var(--hemo-color-secondary);
  color: var(--hemo-color-primary-dark);
  padding: 0.5rem;
  border-radius: 1rem;
  width: 3.5rem;
  aspect-ratio: 4/5;
  text-align: center;
}

.month {
  font-size: 0.8rem;
}

.day {
  font-size: 1.5rem;
  font-weight: bold;
}

.event-card {
  border-radius: 1.5rem;
  background-color: var(--hemo-color-primary-dark);
  color: var(--hemo-color-secondary);
  border: 1px solid var(--hemo-color-primary-dark);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.3s;
}

.event-card:hover {
  box-shadow: 0 0 1rem rgba(33, 33, 33, 0.2);
  cursor: pointer;
}
</style>
