<template>
  <div class="page success-queue-join-page">
    <div class="wrapper">
      <el-icon-success-filled class="icon" />
      <h2>
        <b>Parabéns {{ name }}! Você entrou na fila de doação!</b>
      </h2>
      <p>
        <b>Fique atento ao seu celular</b>, pois entraremos em contato assim que
        sua vez chegar!
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
  }, 3000);
});
</script>

<style scoped lang="scss">
.success-queue-join-page {
  text-align: center;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
}

.wrapper {
  background-color: $color-secondary;
  padding: 1rem;
  border-radius: 1rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: $color-text-secondary;
}

.icon {
  width: 50%;
  color: $color-success;
}
</style>
