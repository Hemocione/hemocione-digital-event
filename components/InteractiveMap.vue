<template>
  <div class="interactive-map-container">
    <!-- Map Iframe -->
    <div class="map-wrapper">
      <iframe
        v-if="mapUrl"
        width="100%"
        height="100%"
        style="border: 0"
        :src="mapUrl"
        loading="lazy"
        allowfullscreen
        referrerpolicy="no-referrer-when-downgrade"
        :title="`Google Maps - ${address}`"
      />
      <div v-else class="map-placeholder">
        <ElIcon :size="48" color="#ccc">
          <ElIconMapLocation />
        </ElIcon>
        <p>Localização não disponível</p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="map-actions">
      <ElButton
        v-if="googleMapsUrl"
        type="primary"
        :icon="ElIconMapLocation"
        @click="openGoogleMaps"
      >
        Ver no Google Maps
      </ElButton>
      
      <ElButton
        v-if="coordinates"
        type="info"
        :icon="ElIconShare"
        @click="shareLocation"
      >
        Compartilhar
      </ElButton>

      <ElButton
        v-if="coordinates"
        type="success"
        :icon="ElIconLocation"
        @click="getUserLocation"
        :loading="isLoadingLocation"
      >
        Como Chegar
      </ElButton>
    </div>

    <!-- User Location Info -->
    <div v-if="userLocation" class="location-info">
      <ElAlert
        :title="`Você está a ${distance?.formatted || 'calculando...'} do evento`"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          <div class="directions-links">
            <a :href="directions?.googleMaps" target="_blank" rel="noopener">
              <ElButton type="primary" size="small">Abrir no Google Maps</ElButton>
            </a>
            <a :href="directions?.waze" target="_blank" rel="noopener">
              <ElButton type="warning" size="small">Abrir no Waze</ElButton>
            </a>
          </div>
        </template>
      </ElAlert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

interface Coordinates {
  lat: number;
  lng: number;
}

interface Props {
  address: string;
  coordinates?: Coordinates;
  eventSlug?: string;
  eventName?: string;
}

const props = defineProps<Props>();

const runtimeConfig = useRuntimeConfig();
const { googleMapsApiKey } = runtimeConfig.public;

const isLoadingLocation = ref(false);
const userLocation = ref<Coordinates | null>(null);
const distance = ref<{ km: number; formatted: string } | null>(null);
const directions = ref<{ googleMaps: string; waze: string } | null>(null);

// Build embed map URL
const mapUrl = computed(() => {
  if (props.coordinates?.lat && props.coordinates?.lng) {
    return `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${props.coordinates.lat},${props.coordinates.lng}`;
  }
  if (props.address) {
    const validAddressString = props.address.replace(/\s/g, "+");
    return `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${validAddressString}`;
  }
  return null;
});

// Build external Google Maps URL
const googleMapsUrl = computed(() => {
  if (props.coordinates?.lat && props.coordinates?.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${props.coordinates.lat},${props.coordinates.lng}`;
  }
  if (props.address) {
    const encoded = encodeURIComponent(props.address);
    return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  }
  return null;
});

function openGoogleMaps() {
  if (googleMapsUrl.value) {
    window.open(googleMapsUrl.value, "_blank");
  }
}

function shareLocation() {
  if (!props.coordinates && !props.address) return;

  const shareData = {
    title: props.eventName || "Evento Hemocione",
    text: `Confira a localização do evento: ${props.eventName}`,
    url: googleMapsUrl.value || window.location.href,
  };

  if (navigator.share) {
    navigator.share(shareData);
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(googleMapsUrl.value || "");
    ElMessage.success("Link copiado para a área de transferência!");
  }
}

async function getUserLocation() {
  if (!navigator.geolocation) {
    ElMessage.error("Geolocalização não é suportada pelo seu navegador");
    return;
  }

  isLoadingLocation.value = true;

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      });
    });

    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;

    userLocation.value = { lat: userLat, lng: userLng };

    // If we have event coordinates, calculate distance
    if (props.coordinates?.lat && props.coordinates?.lng) {
      const dist = calculateDistance(
        userLat,
        userLng,
        props.coordinates.lat,
        props.coordinates.lng,
      );
      distance.value = {
        km: dist,
        formatted: formatDistance(dist),
      };

      // Build directions URLs
      const origin = `${userLat},${userLng}`;
      const destination = `${props.coordinates.lat},${props.coordinates.lng}`;
      directions.value = {
        googleMaps: `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
        waze: `https://waze.com/ul?ll=${props.coordinates.lat},${props.coordinates.lng}&navigate=yes`,
      };

      // Optionally share location with backend
      if (props.eventSlug) {
        await shareLocationWithBackend(userLat, userLng);
      }
    }

    ElMessage.success("Localização obtida com sucesso!");
  } catch (error: any) {
    console.error("Error getting location:", error);
    ElMessage.error(`Erro ao obter localização: ${error.message || "Permissão negada"}`);
  } finally {
    isLoadingLocation.value = false;
  }
}

async function shareLocationWithBackend(lat: number, lng: number) {
  try {
    await $fetch(`/api/v1/event/${props.eventSlug}/location`, {
      method: "POST",
      body: {
        lat,
        lng,
        shareWithEvent: false,
      },
    });
  } catch (error) {
    console.error("Error sharing location with backend:", error);
  }
}

// Calculate distance using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}
</script>

<style scoped>
.interactive-map-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.map-wrapper {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.map-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.location-info {
  margin-top: 0.5rem;
}

.directions-links {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.directions-links a {
  text-decoration: none;
}

@media (max-width: 480px) {
  .map-actions {
    flex-direction: column;
  }

  .map-actions .el-button {
    width: 100%;
  }
}
</style>
