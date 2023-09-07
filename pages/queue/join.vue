<template>
  <div class="page">
    <!-- This page correctly has only one single root element -->
    Page content 2
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const query = route.query;
const { event, eventRef, leadId, uuid } = query;

const { data } = useFetch(`/api/v1/event/${event}`);

const phone = ref(eventRef || "");

console.log({
  event,
  eventRef,
  leadId,
  uuid,
  phone,
  data,
});
</script>

<style scoped>
.page {
  background-color: #fff;
}
</style>
