<template>
  <div></div>
</template>

<script setup lang="ts">
import { useEventStore } from "~/stores/event";
import { formatAddress } from "~/helpers/formatter";
const route = useRoute();
const eventStore = useEventStore();

const eventSlug = route.params.eventSlug as string;
const event = await eventStore.getEvent(eventSlug);
const addressText = event.location ? formatAddress(event.location) : null;

defineOgImage({
  title: event.name,
  addressText,
  startAt: event.startAt,
  component: "EventShareInstagram",
  width: 1080,
  height: 1920,
});
</script>
