<template>
  <div class="layout">
    <NuxtImg
      src="/images/logo-horizontal-branca.svg"
      alt="logo hemocione branca"
      class="logo"
    />
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

.logo {
  width: 50%;
  max-width: 300px;
  padding: 1rem;
  align-self: flex-start;
}
</style>
