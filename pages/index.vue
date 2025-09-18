<template>
  <div class="events-page">
    <header class="events-header">
      <h1 class="events-title">Eventos</h1>
      <div class="search-container">
        <ElButton
          v-if="!locationPermissionGranted"
          @click="requestLocationPermission"
          size="large"
          class="location-button"
          title="Buscar eventos próximos"
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

// Location functionality
const locationPermissionGranted = ref(false);
const userCity = ref("");

watch(search, () => {
  router.push({ query: { search: search.value } });
});
const { data: currentEvents } = await useFetch("/api/v1/event");

const cleanSearch = computed(() => {
  return getCleanText(search.value);
});

const requestLocationPermission = async () => {
  if (!navigator.geolocation) {
    ElMessage.error("Geolocalização não é suportada neste navegador.");
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
    
    // Tentar obter a cidade mais específica possível
    let detectedCity = data.city || data.locality || data.principalSubdivision || "";
    
    // Se retornou região metropolitana, tentar extrair a cidade específica
    if (detectedCity.includes("Região Metropolitana")) {
      // Para o Rio de Janeiro, vamos usar uma abordagem diferente
      // Vamos tentar usar coordenadas para determinar a cidade mais próxima
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      // Coordenadas aproximadas de algumas cidades do RJ
      const rjCities = [
        { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729 },
        { name: "Niterói", lat: -22.8833, lng: -43.1036 },
        { name: "São Gonçalo", lat: -22.8269, lng: -43.0539 },
        { name: "Duque de Caxias", lat: -22.7858, lng: -43.3117 },
        { name: "Nova Iguaçu", lat: -22.7592, lng: -43.4511 },
        { name: "São João de Meriti", lat: -22.8039, lng: -43.3722 },
        { name: "Belford Roxo", lat: -22.7639, lng: -43.3992 },
        { name: "Queimados", lat: -22.7161, lng: -43.5553 },
        { name: "Japeri", lat: -22.6436, lng: -43.6531 },
        { name: "Paracambi", lat: -22.6089, lng: -43.7108 },
        { name: "Seropédica", lat: -22.7431, lng: -43.7075 },
        { name: "Itaguaí", lat: -22.8519, lng: -43.7753 },
        { name: "Mangaratiba", lat: -22.9594, lng: -44.0406 },
        { name: "Maricá", lat: -22.9194, lng: -42.8186 },
        { name: "Itaboraí", lat: -22.7444, lng: -42.8592 },
        { name: "Tanguá", lat: -22.7303, lng: -42.7142 },
        { name: "Magé", lat: -22.6531, lng: -43.0408 },
        { name: "Guapimirim", lat: -22.5367, lng: -42.9819 },
        { name: "Cachoeiras de Macacu", lat: -22.4619, lng: -42.6531 },
        { name: "Rio Bonito", lat: -22.7081, lng: -42.6092 },
        { name: "Silva Jardim", lat: -22.6508, lng: -42.3917 },
        { name: "Casimiro de Abreu", lat: -22.4806, lng: -42.2042 },
        { name: "Araruama", lat: -22.8728, lng: -42.3431 },
        { name: "Saquarema", lat: -22.9208, lng: -42.5106 },
        { name: "Arraial do Cabo", lat: -22.9658, lng: -42.0278 },
        { name: "Cabo Frio", lat: -22.8789, lng: -42.0189 },
        { name: "Búzios", lat: -22.7531, lng: -41.8819 },
        { name: "Iguaba Grande", lat: -22.8419, lng: -42.2281 },
        { name: "São Pedro da Aldeia", lat: -22.8389, lng: -42.1028 },
        { name: "Armação dos Búzios", lat: -22.7531, lng: -41.8819 }
      ];
      
      // Encontrar a cidade mais próxima
      let closestCity = rjCities[0];
      let minDistance = Math.sqrt(Math.pow(lat - closestCity.lat, 2) + Math.pow(lng - closestCity.lng, 2));
      
      for (const city of rjCities) {
        const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2));
        if (distance < minDistance) {
          minDistance = distance;
          closestCity = city;
        }
      }
      
      detectedCity = closestCity.name;
    }
    
    userCity.value = detectedCity;
    locationPermissionGranted.value = true;
    
    ElMessage.success(`Eventos próximos a ${userCity.value} aparecerão primeiro!`);
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
  
  // Se a localização foi permitida e há uma cidade, ordenar por proximidade
  if (locationPermissionGranted.value && userCity.value && events) {
    events = [...events].sort((a, b) => {
      const aCity = getCleanText(a.location?.city || "");
      const bCity = getCleanText(b.location?.city || "");
      const userCityClean = getCleanText(userCity.value);
      
      // Eventos da mesma cidade primeiro
      const aIsSameCity = aCity === userCityClean || aCity.includes(userCityClean) || userCityClean.includes(aCity);
      const bIsSameCity = bCity === userCityClean || bCity.includes(userCityClean) || userCityClean.includes(bCity);
      
      if (aIsSameCity && !bIsSameCity) return -1;
      if (!aIsSameCity && bIsSameCity) return 1;
      
      // Se ambos são da mesma cidade, manter ordem original
      if (aIsSameCity && bIsSameCity) return 0;
      
      // Se ambos não são da mesma cidade, tentar ordenar por proximidade geográfica
      // Para o Rio de Janeiro, vamos usar uma ordenação baseada em distância aproximada
      if (userCityClean.includes("Rio de Janeiro") || userCityClean.includes("Maricá") || userCityClean.includes("Niterói")) {
        const rjMetroCities = ["Rio de Janeiro", "Niterói", "São Gonçalo", "Maricá", "Duque de Caxias", "Nova Iguaçu"];
        const aIsRjMetro = rjMetroCities.some(city => aCity.includes(city));
        const bIsRjMetro = rjMetroCities.some(city => bCity.includes(city));
        
        if (aIsRjMetro && !bIsRjMetro) return -1;
        if (!aIsRjMetro && bIsRjMetro) return 1;
      }
      
      // Manter ordem original para outros casos
      return 0;
    });
  }
  
  return events;
});

const noEventsText = computed(() => {
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
  --el-button-bg-color: var(--hemo-color-white);
  --el-button-border-color: var(--hemo-color-black-10);
  --el-button-text-color: var(--hemo-color-text-secondary);
  --el-button-hover-bg-color: var(--hemo-color-black-5);
  --el-button-hover-border-color: var(--hemo-color-black-20);
  --el-button-hover-text-color: var(--hemo-color-text-primary);
  min-width: 40px;
  height: 40px;
}

.location-icon {
  width: 22px;
  height: 22px;
  color: var(--hemo-color-text-secondary);
}

.search-input {
  width: 100%;
  max-width: 300px;
  --el-input-bg-color: var(--hemo-color-white);
  --el-border-color: var(--hemo-color-black-10);
  --el-input-text-color: var(--hemo-color-text-secondary);
  --el-input-icon-color: var(--hemo-color-text-secondary);
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
