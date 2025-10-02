<template>
  <div class="events-page">
    <header class="events-header">
      <h1 class="events-title">Eventos</h1>
      <div class="search-container">
        <ElButton
          @click="toggleLocationFilter"
          size="large"
          type="default"
          :class="['location-button', { 'location-active': locationPermissionGranted }]"
          :title="locationPermissionGranted ? `Filtrando por: ${userCity}` : 'Buscar eventos próximos'"
        >
          <svg class="location-icon" viewBox="0 0 1024 1024" fill="currentColor">
            <path d="M512 928c23.936 0 117.504-68.352 192.064-153.152C803.456 661.888 864 535.808 864 416c0-189.632-155.84-320-352-320S160 226.368 160 416c0 120.32 60.544 246.4 159.936 359.232C394.432 859.84 488 928 512 928m0-435.2a64 64 0 1 0 0-128 64 64 0 0 0 0 128m0 140.8a204.8 204.8 0 1 1 0-409.6 204.8 204.8 0 0 1 0 409.6"/>
          </svg>
        </ElButton>
        <ElInput
          v-model="search"
          placeholder="Buscar eventos"
          clearable
          size="large"
          :prefix-icon="ElIconSearch"
          class="search-input"
        />
      </div>
    </header>
    <div v-if="filteredEvents?.length" class="events-wrapper">
      <!-- TODO: add transition group here -->
      <EventsListCard
        v-for="event in filteredEvents"
        :key="event._id"
        :name="event.name"
        :event-date="event.startAt"
        :location="event.location"
        :banner="event.banner"
        :slug="event.slug"
      />
    </div>
    <div v-else class="no-events-wrapper">
      <div class="no-events-content">
        <NuxtImg
          class="no-events-image"
          src="/images/illustrations/HemoLogo-triste.svg"
          alt="Ilustração da logo do Hemocione triste"
        />
        <div class="subtitle">
          <span class="no-events-text big-boy">(╯°□°)╯︵ ┻━┻</span>
          <span class="no-events-text">
            {{ noEventsText }}
          </span>
          <span class="no-events-subtext">
            Acompanhe-nos nas redes sociais e aguarde os próximos eventos.
          </span>
          <span class="no-events-subtext"> ┬─┬ノ( º _ ºノ) </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const searchQuery = route.query.search;
const search = ref(String(searchQuery || ""));

const locationPermissionGranted = ref(false);
const userCity = ref("");
const userState = ref("");
const userCoordinates = ref<{ lat: number; lng: number } | null>(null);

watch(search, () => {
  router.push({ query: { search: search.value } });
});
const { data: currentEvents } = await useFetch("/api/v1/event");

const cleanSearch = computed(() => {
  return getCleanText(search.value);
});

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const toggleLocationFilter = async () => {
  if (locationPermissionGranted.value) {
    locationPermissionGranted.value = false;
    userCity.value = "";
    userState.value = "";
    userCoordinates.value = null;
  } else {
    await requestLocationPermission();
  }
};

const requestLocationPermission = async () => {
  if (!navigator.geolocation) {
    return;
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    // Usar uma API de geocoding reversa para obter a cidade
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=pt`
    );
    const data = await response.json();
    console.log("API Response:", data);
    
    // Tentar obter a cidade mais específica possível
    let detectedCity = data.city || data.locality || data.principalSubdivision || "";
    
    // Se retornou algo genérico como "Brasil", tentar usar uma API diferente
    if (detectedCity.includes("Brasil") || detectedCity.includes("Brazil") || detectedCity.length < 3) {
      try {
        // Tentar usar OpenStreetMap Nominatim como fallback
        const osmResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&accept-language=pt-BR,pt,en`
        );
        const osmData = await osmResponse.json();
        console.log("OSM Response:", osmData);
        
        // Tentar extrair cidade do endereço do OSM
        if (osmData.address) {
          const address = osmData.address;
          detectedCity = address.city || 
                        address.town || 
                        address.village || 
                        address.municipality || 
                        address.county || 
                        address.state || 
                        "";
        }
      } catch (error) {
        console.warn("Erro ao usar OSM:", error);
      }
    }
    
    // Se ainda não temos uma cidade específica, tentar a API detalhada
    if (detectedCity.includes("Região Metropolitana") || detectedCity.includes("Brasil") || detectedCity.length < 3) {
      try {
        const detailedResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=pt&localityInfo=true`
        );
        const detailedData = await detailedResponse.json();
        console.log("Detailed API Response:", detailedData);
        
        // Tentar obter informações mais específicas
        if (detailedData.localityInfo?.administrative) {
          const admin = detailedData.localityInfo.administrative;
          // Procurar por cidade mais específica
          for (const level of admin) {
            if (level.name && 
                !level.name.includes("Região Metropolitana") && 
                !level.name.includes("Estado") && 
                !level.name.includes("Brasil") &&
                level.name.length > 3) {
              detectedCity = level.name;
              break;
            }
          }
        }
      } catch (error) {
        console.warn("Não foi possível obter cidade específica:", error);
      }
    }
    
    console.log("Detected City:", detectedCity);
    
    // Validar se a cidade detectada é válida
    const invalidCities = ["Brasil", "Brazil", "Estado", "Região", "Metropolitana"];
    const isValidCity = detectedCity && 
                       detectedCity.length > 3 && 
                       !invalidCities.some(invalid => detectedCity.includes(invalid));
    
    if (!isValidCity) {
      return;
    }
    
    userCity.value = detectedCity;
    userState.value = data.principalSubdivision || "";
    userCoordinates.value = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    locationPermissionGranted.value = true;
  } catch (error) {
    ElMessage.error("Não foi possível obter sua localização. Verifique as permissões do navegador.");
  }
};

const filteredEvents = computed(() => {
  let events = currentEvents.value;
  
  // Se há uma busca por texto, aplicar o filtro de texto
  if (cleanSearch.value) {
    events = events?.filter((event) => {
      const eventBaseString = `${event.name}${event?.location?.address || ""}${event.location?.state || ""}${event.location?.city || ""}`;
      return getCleanText(eventBaseString).includes(cleanSearch.value);
    });
  }
  
  // Se a localização foi permitida e há uma cidade, filtrar apenas eventos da mesma cidade
  if (locationPermissionGranted.value && userCity.value && !cleanSearch.value && events) {
    events = events.filter((event) => {
      const eventCity = getCleanText(event.location?.city || "");
      const userCityClean = getCleanText(userCity.value);
      
      // Verificar se é a mesma cidade (comparação bidirecional)
      return eventCity === userCityClean || 
             eventCity.includes(userCityClean) || 
             userCityClean.includes(eventCity);
    });
  }
  
  return events;
});

const noEventsText = computed(() => {
  if (locationPermissionGranted.value && userCity.value && !cleanSearch.value) {
    return `Nenhum evento encontrado em ${userCity.value}.`;
  }
  if (cleanSearch.value && currentEvents.value?.length) {
    return "Nenhum evento encontrado com o termo pesquisado.";
  }
  return "Estamos sem eventos disponíveis no momento.";
});

definePageMeta({
  name: "EventsListPage",
  middleware(_to, from) {
    if (from.name === "EventPage") {
      from.meta.pageTransition = {
        name: "slide-right",
        mode: "out-in",
        appear: true,
      };
    }
  },
});
</script>

<style scoped>
.events-page {
  padding: 1rem;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.location-button {
  --el-button-bg-color: transparent;
  --el-button-border-color: transparent;
  --el-button-text-color: var(--hemo-color-text-secondary);
  --el-button-hover-bg-color: transparent;
  --el-button-hover-border-color: transparent;
  --el-button-hover-text-color: #fca5a5;
  --el-button-active-bg-color: transparent;
  --el-button-active-border-color: transparent;
  --el-button-active-text-color: #dc2626;
  min-width: 40px;
  height: 40px;
  transition: all 0.3s ease;
}

.location-button.location-active {
  --el-button-bg-color: transparent;
  --el-button-border-color: transparent;
  --el-button-text-color: #dc2626;
  --el-button-hover-bg-color: transparent;
  --el-button-hover-border-color: transparent;
  --el-button-hover-text-color: #fca5a5;
  --el-button-active-bg-color: transparent;
  --el-button-active-border-color: transparent;
  --el-button-active-text-color: #dc2626;
}

.location-icon {
  width: 22px;
  height: 22px;
  color: inherit;
}

.search-input {
  width: 100%;
  max-width: 300px;
  --el-input-bg-color: var(--hemo-color-white);
  --el-border-color: var(--hemo-color-black-10);
  --el-input-text-color: var(--hemo-color-text-secondary);
  --el-input-icon-color: var(--hemo-color-text-secondary);
}

.search-input :deep(.el-input__prefix-inner) {
  padding-left: 0;
}
.events-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  padding-bottom: 1rem;
}
.events-title {
  margin: 0;
  padding: 0;
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: 0.1rem;
  color: var(--hemo-color-black-100);
}
/* this will be a grid */
.events-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  width: 100%;
  height: 100%;
  padding-bottom: 24px;
}

.no-events-image {
  width: 30%;
  padding: 1rem;
}
.no-events-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--hemo-color-text-secondary);
}

.no-events-content {
  max-width: 500px;
  display: flex;
  background-color: var(--hemo-color-white);
  border-radius: 1rem;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.subtitle {
  margin: 0;
  padding: 0 2rem 2rem 2rem;
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.no-events-text {
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
}

.no-events-subtext {
  font-size: 0.9rem;
  text-align: center;
}

.big-boy {
  font-size: 2rem;
}
@media (min-width: 768px) {
  .events-wrapper {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 992px) {
  .events-title {
    font-size: 3rem;
  }
  .events-wrapper {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media (min-width: 1600px) {
  .events-wrapper {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  }
}
</style>
