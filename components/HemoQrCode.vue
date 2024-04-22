<template>
  <article class="wrapper-qrcode">
    <Qrcode :value="content" level="H" :size="size" />
    <figure class="wrapper-logo">
      <NuxtImg class="logo" src="/images/logo.svg" alt="logo" />
    </figure>
  </article>
</template>

<script setup lang="ts">
import Qrcode from "qrcode.vue";

defineProps<{
  content: string;
  size: number;
}>();
</script>

<style scoped>
.wrapper-qrcode {
  position: relative;
}

.wrapper-logo {
  margin: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo {
  width: 20%;
  aspect-ratio: 1;
  object-fit: contain;
  background-color: white;
  border-radius: 12.5%;
  box-shadow: 1px 1px 4px var(--hemo-color-text-secondary);
  padding: 16px;
}
</style>
