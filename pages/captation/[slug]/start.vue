<template>
  <div class="landing-page">
    <!-- Content -->
    <div class="content">
      <!-- Logo -->
      <img
        src="/images/logo-hemocione-principal.svg"
        alt="Hemocione"
        class="logo"
      />

      <!-- Text Content -->
      <div class="text-container">
        <p class="description" v-html="description"></p>
      </div>

      <!-- Background Image -->
      <div class="image-container">
        <img
          src="/images/hero.webp"
          alt="Background"
          class="background-image"
          loading="eager"
        />
      </div>

      <!-- Button Section -->
      <div class="button-section">
        <p class="button-text">
          Preencha o formulário e garanta uma visita do Hemocione na sua
          instituição!
        </p>
        <el-button
          type="primary"
          size="large"
          class="continue-button"
          @click="goToCaptationForm"
          :loading="goingToCaptationForm"
          :disabled="goingToCaptationForm"
        >
          Garantir minha visita
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});
const route = useRoute();
const slug = String(route.params.slug);
assertEntityType(slug);

const { eventId, eventRef, leadId, uuid } = route.query;

const captationData = {
  eventId,
  eventRef,
  leadId,
  uuid,
};

const captationFormUrl = getCaptationFormUrl(slug);

if (leadId && uuid) {
  setCaptationDataToLocalStorage(captationData);
}

const description = computed(() => {
  if (leadId && uuid) {
    return "A <b>Layers, Bookfair e Sophia</b> acreditam que a doação de sangue salva vidas e querem ajudar sua escola a participar desse movimento! Garanta uma visita do Hemocione, ONG que transforma a cultura de doação de sangue no Brasil, na sua instituição. Esta ação é viabilizada por nossos parceiros que apoiam esta causa.";
  }

  return "O Hemocione é uma ONG liderada por jovens que, desde 2017, transforma a cultura da doação de sangue no Brasil. Conectamos instituições a bancos de sangue para salvar vidas. Já realizamos mais de 223 eventos, impactando 38 mil vidas com ações educativas e tecnologia em escolas, universidades e empresas. Quer fazer a diferença? Garanta uma visita do Hemocione na sua instituição!";
});

const finishedNotifying = ref(false);
const goingToCaptationForm = ref(false);
const goToCaptationForm = () => {
  goingToCaptationForm.value = true;
  window.location.href = captationFormUrl;
};

// trigger request to notify hemocione discord channel
useFetch("/api/v1/captation/" + slug + "/start", {
  method: "POST",
  body: captationData,
}).finally(() => {
  finishedNotifying.value = true;
});
</script>

<style scoped>
.landing-page {
  height: 100svh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: white;
}

.content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 42rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  margin: 0 auto;
  height: 100%;
}

.logo {
  width: 10rem;
  margin-top: 2rem;
}

.text-container {
  width: 100%;
  text-align: center;
  padding: 0 1rem;
  margin: auto 0;
}

.description {
  color: #1f2937;
  font-size: 0.85rem;
  line-height: 1.4;
}

.background-image {
  width: 100%;
  object-fit: contain;
  aspect-ratio: 16/9;
  min-height: 0;
  display: block;
}

.image-container {
  width: 100%;
  max-width: 30rem;
  margin: 1rem auto;
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-section {
  width: 100%;
  text-align: center;
  margin: auto 0 0 0;
}

.button-text {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.75rem;
}

.continue-button {
  font-weight: 600;
  font-size: 1.25rem;
  width: 100%;
  max-width: 42rem;
  padding: 1.5rem;
  border-radius: 1rem;
  margin: 0;
  height: auto;
  min-height: 4rem;
}

@media (min-width: 768px) {
  .content {
    padding: 2rem;
  }

  .logo {
    width: 12rem;
  }

  .description {
    font-size: 0.9375rem;
    line-height: 1.5;
  }

  .background-image,
  .image-container {
    max-width: 32rem;
  }

  .button-text {
    font-size: 1rem;
  }

  .continue-button {
    width: auto;
    padding: 1rem 3rem;
    border-radius: 4px;
    min-height: 3.5rem;
  }
}
</style>
