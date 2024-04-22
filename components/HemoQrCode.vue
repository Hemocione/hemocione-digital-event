<template>
  <article class="wrapper-qrcode">
    <Qrcode :value="content" level="H" :size="size" />
    <figure class="wrappper-logo">
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

.wrappper-logo {
  position: absolute;
  left: 34.5%;
  top: 32.5%;
  width: 20%;
  height: 20%;
  aspect-ratio: 1 / 1;
  background-color: white;
  border-radius: 12.5%;
  box-shadow: 1px 1px 4px var(--hemo-color-text-secondary);
  margin: 0;
  padding: 4%;
  box-sizing: content-box;
}

.logo {
  object-fit: contain;
  width: 100%;
  height: 100%;
}
</style>
