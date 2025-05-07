<template>
  <div class="layout">
    <NavBar />
    <div class="page">
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
  min-height: calc(100dvh - var(--hemo-navbar-height));
  padding: 0;
}
</style>
