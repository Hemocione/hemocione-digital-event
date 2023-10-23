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
  position: sticky;
  background: linear-gradient(
    180deg,
    rgba(187, 10, 8, 1),
    rgba(187, 10, 8, 1),
    rgba(187, 10, 8, 1),
    rgba(187, 10, 8, 0.9),
    rgba(187, 10, 8, 0.8),
    rgba(187, 10, 8, 0.7),
    rgba(187, 10, 8, 0.6),
    rgba(187, 10, 8, 0.5),
    rgba(187, 10, 8, 0.3),
    rgba(187, 10, 8, 0.1),
    rgba(187, 10, 8, 0.05),
    rgba(187, 10, 8, 0)
  );
  top: 0;
  left: 0;
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
