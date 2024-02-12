<template>
  <main v-if="eventConfig" class="ticket-page">
    <CommonEventHeader :event-name="eventConfig.name" @back="goBack" />
    <article>
      <CommonCard class="ticket-card">
        <span>#1234</span>
        <span>Doador da silva</span>
        <section class="schedule-time">
          <span>Seu horário para doação é: 12:00</span>
        </section>
        <ElButton>Cancelar agendamento</ElButton>
      </CommonCard>
      <section class="event-info-container">
        <span>Informações do evento</span>
        <span><strong>Colégio Santo Agostinho 2023</strong></span>
        <EventsInfo :address-text="addressText" :time-text="timeText" />
      </section>
    </article>
  </main>
</template>

<script setup lang="ts">
import { formatTimeDuration, formatAddress } from "~/helpers/formatter";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const eventSlug = route.params.eventSlug as string;

const { data: eventConfig } = await useFetch(`/api/v1/event/${eventSlug}`);

const timeText = computed(() => {
  if (!eventConfig.value?.startAt) return "";

  return formatTimeDuration(eventConfig.value.startAt, eventConfig.value.endAt);
});

const addressText = computed(() => {
  if (!eventConfig.value?.location) return null;

  return formatAddress(eventConfig.value.location);
});

function goBack() {
  navigateTo(`/event/${eventSlug}`);
}
</script>

<style scoped>
.ticket-page {
  width: 100%;
  max-width: var(--hemo-page-max-width);
  margin: 0 auto;
  min-height: 93dvh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background-color: var(--hemo-color-white);
  color: var(--hemo-color-text-secondary);
}

article {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
}

.ticket-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.schedule-time {
  padding: 1rem;
  background-color: var(--hemo-color-secondary);
  border-radius: 8px;
}

.event-info-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media screen and (min-width: 1080px) {
  .ticket-page {
    border-radius: 8px;
  }
}
</style>
