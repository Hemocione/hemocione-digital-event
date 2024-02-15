<template>
  <nav v-if="!isIframed" :class="{ 'nav-bar': true, hide: !validatedIframe }">
    <NuxtLink to="/" class="logo-wrapper">
      <NuxtImg
        src="/images/logo-horizontal-branca.svg"
        alt="logo hemocione branca"
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
  padding: 1rem;
  position: sticky;
  align-items: center;
  background-color: var(--hemo-color-primary);
  top: 0;
  left: 0;
  height: 7dvh;
}

.hide {
  visibility: hidden;
}
.logo-wrapper {
  width: 50%;
  max-width: 250px;
}

.logo {
  width: 100%;
}
</style>
