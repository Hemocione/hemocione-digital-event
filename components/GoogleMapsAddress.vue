<template>
  <iframe
    width="100%"
    height="100%"
    style="border: 0"
    :src="googleMapsIframeUrl"
    loading="lazy"
    allowfullscreen
    referrerpolicy="no-referrer-when-downgrade"
    :title="`Google Maps - ${props.address}`"
  >
  </iframe>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();
const { googleMapsApiKey } = runtimeConfig.public;
const props = defineProps<{
  address: string;
}>();

const googleMapsIframeUrl = computed(() => {
  const validAddressString = props.address.replace(/\s/g, "+");
  // const encodedAddressString = encodeURIComponent(validAddressString);
  return `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${validAddressString}`;
});
</script>
