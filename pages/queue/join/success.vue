<template>
  <div class="page success-queue-join-page">
    <div class="wrapper">
      <el-icon-success-filled class="icon" />
        <h2 class="text-item">
          Parabéns {{ name }}! Você entrou na fila de doação!
        </h2>
        <p class="text-item">
          <b>Fique atento ao seu celular</b>. Entraremos em contato assim que
          for a sua vez de doar!
        </p>
    </div>
  </div>
</template>
<script setup lang="ts">
const route = useRoute();
const { name, leadId, uuid } = route.query;

onMounted(() => {
  setTimeout(async () => {
    await navigateTo(
      `https://estande-digital.layers.digital/leadIntent?leadId=${leadId}&uuid=${uuid}`,
      { external: true },
    );
  }, 5000);
});
</script>

<style scoped>
.success-queue-join-page {
  text-align: center;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
}

.text-item {
  margin: 0
}

.wrapper {
  background-color: var(--hemo-color-secondary);
  padding: 1rem;
  border-radius: 1rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--hemo-color-text-secondary);
}

.icon {
  max-width: 100px;
  width: 50%;
  color: var(--hemo-color-success);
}
</style>
