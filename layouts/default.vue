<template>
  <div class="layout">
    <NavBar />
    <div class="page">
      <NuxtLoadingIndicator color="#f2f2f2" :height="3" />
      <slot />
    </div>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100dvh;
  width: 100%;
}

.page {
  width: 100%;
  min-height: 93dvh;
  height: 100%;
}
</style>
