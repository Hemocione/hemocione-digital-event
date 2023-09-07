<template>
  <div>
    <!-- This page correctly has only one single root element -->
    Page content 2
  </div>
</template>

<script setup lang="ts">
const query = this.$route.query;
const { event, eventRef, leadId, uuid } = query;
</script>