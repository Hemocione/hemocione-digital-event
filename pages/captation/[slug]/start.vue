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
        <p class="button-text" v-html="buttonExplanationText"></p>
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
    return `
      Uma ação solidária que pode <b>transformar vidas</b> na sua escola. <br />
      A <b>Layers, Bookfair e Sophia</b> acreditam no poder da doação de sangue e estão viabilizando a visita do Hemocione à sua instituição — um presente das nossas empresas para ajudar a levar esse movimento de solidariedade ainda mais longe. <br />
      O Hemocione é uma ONG que promove a cultura da doação de sangue nas escolas e comunidades de todo o Brasil. <b>Agora, sua escola também pode fazer parte dessa causa.</b>
    `;
  }

  return "O Hemocione é uma ONG liderada por jovens que, desde 2017, transforma a cultura da doação de sangue no Brasil. Conectamos instituições a bancos de sangue para <b>salvar vidas</b>. Já realizamos mais de <b>223 eventos</b>, impactando <b>38 mil vidas</b> com ações educativas e tecnologia em escolas, universidades e empresas. Quer fazer a diferença? Garanta uma visita do Hemocione na sua instituição!";
});

const buttonExplanationText = computed(() => {
  if (leadId && uuid) {
    return "Preencha o formulário e garanta uma visita do Hemocione à sua instituição, com o apoio da Layers, Bookfair e Sophia.";
  }

  return "Preencha o formulário e garanta uma visita do Hemocione na sua instituição!";
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
  text-align: justify;
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
  height: 20svh;
  margin: 0 1rem;
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
  color: #1f2937;
  margin-bottom: 0.75rem;
  font-weight: 600;
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
