<template>
  <main class="ticket-page">
    <CommonEventHeader @back="goBack" />
    <article>
      <CommonCard class="ticket-card">
        <span>#1234</span>
        <span>Doador da silva</span>
        <section class="schedule-time">
          <span>Seu horário para doação é: 12:00</span>
        </section>
        <ElButton>Cancelar agendamento</ElButton>
      </CommonCard>
      <section class="event-info">
        <span>Informações do evento</span>
        <span><strong>Colégio Santo Agostinho 2023</strong></span>
      </section>
    </article>
  </main>
</template>

<script setup lang="ts">
const route = useRoute();
const eventSlug = route.params.eventSlug as string;

function goBack() {
  navigateTo(`/event/${eventSlug}`);
}
</script>

<style scoped>
.ticket-page {
  width: 100%;
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
  gap: 1rem;
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

.event-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
