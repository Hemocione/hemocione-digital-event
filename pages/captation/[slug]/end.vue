<template>
  <div class="loading-animation">
    <div class="loading-animation-dot"></div>
    <div class="loading-animation-dot"></div>
    <div class="loading-animation-dot"></div>
  </div>
</template>

<style scoped>
.loading-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100svh;
  gap: 8px;
}

.loading-animation-dot {
  width: 12px;
  height: 12px;
  background-color: #bb0a08;
  border-radius: 50%;
  animation: loading 1s infinite ease-in-out;
}

.loading-animation-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-animation-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes loading {
  0%,
  100% {
    transform: scale(0.3);
    opacity: 0.3;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

<script setup lang="ts">
definePageMeta({
  layout: false,
});
const route = useRoute();
const slug = String(route.params.slug);
assertEntityType(slug);

const hemocioneSiteUrl = useRuntimeConfig().public.hemocioneSiteUrl;
const captationData = getCaptationDataFromLocalStorage();
deleteCaptationDataFromLocalStorage(); // always delete the data from local storage after the end page is accesed and the captationData is read

const goToCorrectUrl = async () => {
  if (captationData?.leadId && captationData?.uuid) {
    const digitalStandUrl = getDigitalStandTicketUrl(
      captationData.leadId,
      captationData.uuid,
    );
    await navigateTo(digitalStandUrl, {
      external: true,
    });
  } else {
    await navigateTo(hemocioneSiteUrl, {
      external: true,
    });
  }
};

useFetch("/api/v1/captation/" + slug + "/end", {
  method: "POST",
  body: captationData,
}).finally(goToCorrectUrl);
</script>
