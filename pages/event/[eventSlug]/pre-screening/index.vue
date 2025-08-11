<template>
  <div class="page-wrapper">
    <div class="pre-screening-middle-page">
      <CommonEventHeader :event-name="eventConfig.name" @back="goBack" />
      <main class="content">
        <p class="description">
          Para continuar a inscrição, responda o questionário e verifique se
          você pode realizar a doação.
        </p>

        <p class="note">
          Este questionário serve como uma orientação inicial com perguntas
          frequentes sobre a doação, mas não substitui a triagem realizada por
          profissionais de saúde no dia e no local da doação.
        </p>

        <NuxtImg
          src="images/donation-illustration.svg"
          alt="Ilustração de Doação"
          class="illustration"
        />
      </main>
      <PreScreeningMiddleFooter :event-slug="eventSlug" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import { useEventStore } from "~/stores/event";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const eventStore = useEventStore();
const router = useRouter();
const userStore = useUserStore();

const eventSlug = route.params.eventSlug as string;

// 1) Fast path: usa o cache local
if (userStore.hasSubscriptionInEvent(eventSlug)) {
  navigateTo(`/event/${eventSlug}/ticket`);
}

// 2) Check definitivo: busca no backend se necessário
const existing = await userStore.getSubscription(eventSlug);
if (existing) {
  navigateTo(`/event/${eventSlug}/ticket`);
}

const eventConfig = await eventStore.getEvent(eventSlug);

function goBack() {
  navigateTo(`/event/${eventSlug}`);
}
</script>

<style scoped>
.pre-screening-middle-page {
  width: 100%;
  max-width: var(--hemo-page-max-width);
  margin: 0 auto;
  min-height: calc(100dvh - var(--hemo-navbar-height));
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background-color: var(--hemo-color-white);
  color: var(--hemo-color-text-secondary);
}

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: var(--navbar-height);
  background-color: var(--hemo-color-primary-extra-light);
}

.logo {
  width: 130px;
}

.content {
  padding: 20px;
  background-color: var(--hemo-color-white);
  text-align: center;
  flex-grow: 1;
}

.content h2 {
  font-size: 1.8rem;
  color: var(--hemo-color-primary);
  margin-bottom: 16px;
}

.description {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 12px;
  color: var(--hemo-color-black-100);
  text-align: left;
}

.note {
  font-size: 0.9rem;
  color: var(--hemo-color-black-80);
  margin-bottom: 24px;
  text-align: left;
}

.illustration {
  min-width: 300px;
  margin-top: 20px;
}

.button-container {
  padding: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skip-button {
  background-color: var(--hemo-color-white);
  color: var(--hemo-color-primary);
  border: 2px solid var(--hemo-color-primary);
  border-radius: 8px;
  padding: 12px;
  font-size: 1rem;
  cursor: pointer;
}

.continue-button {
  background-color: var(--hemo-color-primary);
  color: var(--hemo-color-white);
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 1rem;
  cursor: pointer;
}
</style>
