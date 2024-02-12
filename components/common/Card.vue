<template>
  <div class="default-card" :class="{ focus }">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps({
  focus: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.default-card {
  box-shadow: inset 0 0 0 1px var(--hemo-color-text-secondary-opaque);
  border-radius: 8px;
  width: fit-content;
  height: fit-content;
  padding: 1rem;

  transition: box-shadow 0.2s;
}

.default-card.focus {
  background-color: rgba(233, 60, 60, 0.1);
  box-shadow: inset 0 0 0 2px var(--hemo-color-primary);
  cursor: pointer;
}
</style>
