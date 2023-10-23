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
  height: 100dvh;
  width: 100%;
}

.page {
  padding: 1rem 2rem;
  width: 100%;
  height: 90vh;
}
</style>
