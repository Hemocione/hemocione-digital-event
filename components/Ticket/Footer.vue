<template>
  <CommonCoolFooter height="fit-content" desktop-border-radius="0">
    <ElButton type="primary" size="large" @click="shareEvent">
      Compartilhar evento
    </ElButton>
  </CommonCoolFooter>
</template>

<script setup lang="ts">
const props = defineProps({
  eventSlug: {
    type: String,
    required: true,
  },
});

function shareEvent() {
  const baseUrl = window.location.origin;
  const url = `${baseUrl}/event/${props.eventSlug}`;

  if (navigator.share) {
    navigator.share({
      title: "Hemocione",
      text: "Estou participando de um evento Hemocione! Venha comigo!",
      url,
    });

    return;
  }

  navigator.clipboard.writeText(url);
  ElNotification({
    title: "Link copiado",
    message: "O link do evento foi copiado para a área de transferência.",
    type: "success",
  });
}
</script>

<style scoped>
button {
  height: 48px;
}
</style>
