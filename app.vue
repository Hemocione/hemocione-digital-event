<template>
  <NuxtLayout>
    <NuxtPage />
    <ClientOnly>
      <SidePillTag
        title="Hemocione"
        cta-text="INSTALAR APP"
        store-url="https://apps.apple.com/app/idXXXXXXXXX"
        icon="/icons/drop.svg"
        :top="96"
        :height="100"
        :peek-width="80"
        :open-width="420"
        :radius="48"
        :line-width="3"
        line-color="#E54B4B"
        :right="16"          
        :right-closed="0"    
        :edge-nudge="0.5"    
        :use-element-plus="false"
      />
    </ClientOnly>
  </NuxtLayout>
</template>

<script setup lang="ts">
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

// signos widget
useHead({
  script: [{ src: "https://widget.getsignos.com/widget.js", defer: true }],
});
</script>
