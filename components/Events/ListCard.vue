<template>
  <NuxtLink :class="{'event-card': true,old:oldEvent
  }" :to="`/event/${slug}`">
    <NuxtImg
      :format="banner ? 'webp' : undefined"
      fit="cover"
      :src="banner || '/images/illustrations/rafiki-blood-donation.svg'"
      :class="banner ? 'card-header-image' : 'card-header-image-default'"
      :alt="`Banner - ${name}`"
    />
    <div class="header-wrapper">
      <MicroDateBox :date="eventDate" />
      <div class="event-details">
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
      </div>
      <el-icon class="arrow-icon">
        <ElIconArrowRightBold />
      </el-icon>
    </div>
  </NuxtLink>
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
  slug: string;
  oldEvent?: boolean;
}>();

const addressText = computed(() => {
  if (!props.location) return null;
  const { address, city, state } = props.location;
  return `${address} - ${city}, ${state}`;
});
</script>

<style scoped>
.card-header-image,
.card-header-image-default {
  width: 100%;
  aspect-ratio: 2/1;
  border-radius: 0.5rem;
}

.card-header-image-default {
  background-color: var(--hemo-color-secondary);
}

.old{
  opacity: 0.8;
}

.arrow-icon {
  font-size: 2rem;
  color: var(--hemo-color-primary);
}

.icon {
  color: var(--hemo-color-primary-light);
  padding-bottom: 0.1rem;
  height: fit-content;
}

.event-name {
  margin: 0;
  font-size: 1.1rem;
}

.address {
  padding-top: 0.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.header-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
}

.event-details {
  display: flex;
  flex-direction: column;
  margin-left: 1rem;
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
  background-color: var(--hemo-color-primary);
  color: var(--hemo-color-white);
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
  background-color: var(--hemo-color-white);
  color: var(--hemo-color-black-100);
  border: 1px solid var(--hemo-color-black-10);
  box-shadow: 0 0 1rem rgba(33, 33, 33, 0.1);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.3s;
}

.event-card:hover {
  box-shadow: 0 0 1rem rgba(33, 33, 33, 0.3);
  cursor: pointer;
}
</style>
