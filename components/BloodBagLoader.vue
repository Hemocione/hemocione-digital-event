<template>
  <div class="bloodbag-wrapper">
    <img
      src="/images/bloodbag-reverse.svg"
      alt="bloodbag-reversed-background"
      class="bloodbag-background"
    />
    <img
      ref="bloodbag"
      src="/images/bloodbag-fillable.svg"
      alt="bloodbag"
      class="bloodbag"
    />
    <div
      v-if="bloodbag?.clientWidth"
      class="bloodbag-wave-wrapper"
      :style="`--bloodBagWidth: ${bloodbag?.clientWidth}px; --percentage: ${percentage}%`"
    >
      <AnimatedWave />
      <div class="rectangle" />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  percentage: number;
}>();

const bloodbag = ref<HTMLImageElement | null>(null);
</script>

<style scoped>
.bloodbag-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: relative;
}

.bloodbag-wrapper img {
  position: absolute;
  top: 0;
  height: 100%;
}

.bloodbag {
  z-index: 2;
}
.rectangle {
  background-color: var(--hemo-color-primary);
  width: 100%;
  height: max(var(--percentage), 5%);
}

.bloodbag-wave-wrapper {
  position: absolute;
  bottom: 0;
  z-index: 0;
  width: calc(var(--bloodBagWidth) - 6px);
  height: 100%;
  padding: 3px 0;
  overflow: hidden;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  flex-direction: column;
}

.bloodbag-background {
  z-index: 1;
}
</style>
