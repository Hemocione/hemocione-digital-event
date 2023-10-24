<template>
  <div class="event-page">
    <h1 class="events-title">Eventos</h1>
    <div v-if="currentEvents?.length" class="events-wrapper">
      <EventsListCard
        v-for="event in currentEvents"
        :key="event._id"
        :name="event.name"
        :event-date="event.startAt"
        :location="event.location"
        :banner="event.banner"
      />
    </div>
    <div v-else class="no-events-wrapper">
      <div class="no-events-content">
        <NuxtImg
          class="no-events-image"
          src="/images/illustrations/rafiki-time-management.svg"
          alt="Ilustração de uma pessoa com um relógio aguardando um próximo evento do Hemocione"
        />
        <div class="subtitle">
          <span class="no-events-text big-boy">(╯°□°)╯︵ ┻━┻</span>
          <span class="no-events-text">
            Estamos sem eventos disponíveis no momento.
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
const { data: currentEvents } = await useFetch("/api/v1/event");
</script>

<style scoped>
.events-title {
  margin: 0;
  padding: 0;
  font-size: 3rem;
  font-weight: bold;
  padding-bottom: 1rem;
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
  width: 80%;
  padding-bottom: 1rem;
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
  background-color: var(--hemo-color-secondary);
  border-radius: 1rem;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
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
