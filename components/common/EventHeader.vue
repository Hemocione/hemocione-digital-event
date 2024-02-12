<template>
  <header>
    <button class="go-back-button" @click="goBack">
      <ElIconArrowLeftBold />
    </button>
    <span>Colégio Santo Agostinho 2023</span>
  </header>
</template>

<script setup>
const emit = defineEmits(["back"]);

const goBack = () => {
  emit("back");
};
</script>

<style scoped>
header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  width: 100%;
  height: fit-content;
  border-bottom: 2px solid var(--hemo-color-text-secondary-opaque);
}

.go-back-button {
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-items: center;
}
.go-back-button svg {
  width: 1rem;
  height: 1rem;
}
</style>
