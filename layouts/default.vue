<template>
  <div class="layout">
    <nav class="nav-bar">
      <NuxtImg
        src="/images/logo-horizontal-branca.svg"
        alt="logo hemocione branca"
        class="logo"
      />
    </nav>
    <div class="page">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  gap: 1rem;
  align-items: center;
  justify-content: center;
}

.nav-bar {
  width: 100%;
  display: flex;
  z-index: 1000;
  padding: 1rem 2rem;
  background-color: var(--hemo-color-primary);
}

.logo {
  width: 50%;
  max-width: 300px;
  align-self: flex-start;
}

.page {
  padding: 1rem 2rem;
}
</style>
