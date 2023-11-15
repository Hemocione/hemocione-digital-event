<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  title: "Hemocione Eventos",
});
useServerSeoMeta({
  title: "Hemocione Eventos",
  ogTitle: "Hemocione Eventos",
  description:
    "Encontre eventos de doação de sangue próximos a você e ajude a salvar vidas!",
  ogDescription:
    "Encontre eventos de doação de sangue próximos a você e ajude a salvar vidas!",
  ogImage:
    "https://cdn.hemocione.com.br/events/uploads/1699940076138-logo_hemocione_fb-2(1).png",
  twitterCard: "summary_large_image",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0",
});
</script>
