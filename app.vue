<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { evaluateCurrentLogin } from "./middleware/auth";

const route = useRoute();

await evaluateCurrentLogin(route.query);

useServerSeoMeta({
  description:
    "Encontre eventos de doação de sangue próximos a você e ajude a salvar vidas!",
  ogDescription:
    "Encontre eventos de doação de sangue próximos a você e ajude a salvar vidas!",
  ogImage:
    "https://cdn.hemocione.com.br/events/uploads/1699940076138-logo_hemocione_fb-2(1).png",
  twitterCard: "summary_large_image",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=5.0",
});
</script>
