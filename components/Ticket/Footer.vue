<template>
  <CommonCoolFooter height="fit-content" desktop-border-radius="0">
    <ElButton
      v-if="hasShareAPI"
      type="primary"
      size="large"
      @click="shareEvent"
    >
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

const hasShareAPI = !!navigator.share;

function shareEvent() {
  const baseUrl = window.location.origin;

  navigator.share({
    title: "Hemocione",
    text: "Estou participando de um evento Hemocione! Venha comigo!",
    url: `${baseUrl}/event/${props.eventSlug}`,
  });
}
</script>

<style scoped>
button {
  height: 48px;
}
</style>
