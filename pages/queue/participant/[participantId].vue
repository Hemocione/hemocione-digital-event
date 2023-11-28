<template>
  <div class="main-container">
    <div class="image-container">

      <img v-if="eventInfo?.banner" class="main-image" :src="eventInfo?.banner" />
      <img v-else class="main-image" src="/images/illustrations/rafiki-blood-donation.svg" />

    </div>
    <div class="content">
      <div class="event-title-container">
        <div class="event-title">{{ eventInfo?.name }}</div>

        <MicroDateBox v-if="eventInfo?.startAt" :date="eventInfo?.startAt" :light="true" />
      </div>
      <div class="queue-info">
        <div class="queue-message">
          Olá {{ participantInfo?.participant?.name }},<br />
          você está na {{ participantInfo?.position }}ª posição da fila!
        </div>
        <div class="queue-position">{{ participantInfo?.position }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';

definePageMeta({
  layout: 'no-scroll-no-padding'
});

const ONE_SECOND = 1000;

const route = useRoute();
const router = useRouter()
const { participantId } = route.params
const { eventId } = route.query

const shouldRedirect = !eventId

if (shouldRedirect) await navigateTo("/queue/not-found")

const { data: participantInfo, refresh } = await useFetch(`/api/v1/participant/${participantId}/position`, {
  method: "GET",
});

const { data: eventInfo } = await useFetch(`/api/v1/event/${eventId}`, {
  method: "GET",
});

const addressText = computed(() => {
  if (!eventInfo.value?.location) return null;

  const { address, city, state } = eventInfo.value.location;
  return `${address} - ${city}, ${state}`;
});

onMounted(async () => {
  await router.isReady()

  setInterval(async () => {
    await refresh()
  }, 5 * ONE_SECOND)
});
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 0px 16px;
}

.header {
  align-self: stretch;
  height: 40px;
  padding: 0 24px;
  background: #BB0A08;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-container {
  width: 312px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
}

.logo {
  width: 165px;
  height: 18px;
}

.image-container {
  align-self: stretch;
  display: flex;
  justify-content: center;
  align-items: center;
  object-fit: cover;
}

.main-image {
  align-self: stretch;
  width: 75%;
  max-width: 400px;
}

.content {
  align-self: stretch;
  flex-grow: 1;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.event-title-container {
  align-self: stretch;
  padding: 0 16px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
}

.event-title {
  flex-grow: 1;
  color: #25282B;
  font-size: 26px;
  font-family: Lato;
  font-weight: 700;
}

.date-box {
  width: 48px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #CACCCF;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.month {
  text-align: center;
  color: #BB0A08;
  font-size: 12px;
  font-family: Lato;
  font-weight: 400;
  line-height: 14px;
}

.day {
  text-align: center;
  color: #BB0A08;
  font-size: 18px;
  font-family: Lato;
  font-weight: 500;
}

.queue-info {
  align-self: stretch;
  height: 266px;
  padding: 24px;
  background: #BB0A08;
  border-radius: 8px;
  border: 2px solid #CACCCF;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.queue-message,
.custom-message {
  align-self: stretch;
  color: white;
  font-size: 21px;
  font-family: Lato;
  font-weight: 400;
}

.queue-position {
  width: 120px;
  height: 120px;
  padding: 16px;
  background: #D87C7F;
  border-radius: 1000px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 80px;
  font-family: Lato;
  font-weight: 700;
}

.event-details {
  align-self: stretch;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title {
  color: #25282B;
  font-size: 22px;
  font-family: Lato;
  font-weight: 600;
}

.description {
  color: #52575C;
  font-size: 16px;
  font-family: Lato;
  font-weight: 400;
  line-height: 20px;
}

.more-info {
  color: #BB0A08;
  font-size: 16px;
  font-family: Lato;
  font-weight: 400;
  line-height: 20px;
}

.location {
  align-self: stretch;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.location-title {
  color: #25282B;
  font-size: 22px;
  font-family: Lato;
  font-weight: 600;
}

.map-image {
  width: 360px;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.address {
  align-self: stretch;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.school-name,
.school-address {
  color: #52575C;
  font-size: 16px;
  font-family: Lato;
  font-weight: 400;
  line-height: 20px;
}

.actions {
  align-self: stretch;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-button,
.secondary-button {
  height: 48px;
  padding: 8px 32px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-button {
  background: #E93C3C;
  color: white;
}

.secondary-button {
  background: white;
  border: 1px solid #CACCCF;
  color: #52575C;
}

.queue-position-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 16px;
  font-family: Lato;
  font-weight: 400;
}

.footer {
  display: flex;
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: blue;
  width: 100%;
  padding: 8px 16px;
  gap: 16px;
}
</style>
