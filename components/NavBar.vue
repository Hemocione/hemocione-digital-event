<template>
  <nav class="nav-bar">
    <NuxtImg
      src="/images/logo-horizontal-branca.svg"
      alt="logo hemocione branca"
      class="logo"
    />
  </nav>
</template>

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

.logo {
  height: 100%;
  max-width: 50%;
}
</style>
