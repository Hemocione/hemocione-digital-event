<template>
  <button
    v-if="available"
    type="button"
    class="hemarcio-ask-button"
    @click="ask(intent, context)"
  >
    <img
      class="hemarcio-ask-face"
      src="/hemarcio-face.svg"
      alt=""
      width="24"
      height="24"
    />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  intent: string;
  context: Record<string, unknown>;
  label: string;
}>();

const { available, ask } = useHemarcioAsk();
</script>

<style scoped>
.hemarcio-ask-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 44px;
  padding: 8px 16px;
  border: 1px solid var(--hemo-color-primary-medium);
  border-radius: 8px;
  background-color: var(--hemo-color-white);
  color: var(--hemo-color-primary-medium);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.hemarcio-ask-button:hover {
  background-color: var(--hemo-color-gray);
}

.hemarcio-ask-face {
  flex-shrink: 0;
}
</style>
