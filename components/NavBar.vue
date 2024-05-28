<template>
  <nav v-if="!isIframed" :class="{ 'nav-bar': true, hide: !validatedIframe }">
    <NuxtLink to="/" class="logo-wrapper">
      <NuxtImg
        src="/images/logo-horizontal-vermelha-branca.svg"
        alt="logo hemocione vermelha e preta"
        class="logo"
      />
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const isIframed = ref(false);
const validatedIframe = ref(false);

onMounted(() => {
  isIframed.value = window !== window.top;
  validatedIframe.value = true;
});
</script>

<style scoped>
.nav-bar {
  width: 100%;
  display: flex;
  z-index: 1000;
  padding: 0.5rem;
  position: sticky;
  align-items: center;
  background-color: var( --hemo-color-black-100);
  top: 0;
  left: 0;
  height: 7dvh;
}

.hide {
  visibility: hidden;
}
.logo-wrapper {
  height: 100%;
}

.logo {
  height: 100%;
}
</style>
