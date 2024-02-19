<template>
  <div class="main-container">
    <div class="image-container">
      <NuxtImg
        v-if="eventInfo?.banner"
        class="main-image"
        style="aspect-ratio: 3/1; object-fit: cover"
        :src="eventInfo?.banner"
      />
      <NuxtImg
        v-else
        class="main-image"
        src="/images/illustrations/rafiki-blood-donation.svg"
      />
    </div>

    <div class="content">
      <div class="event-title-container">
        <div class="event-title">{{ eventInfo?.name }}</div>
        <MicroDateBox
          v-if="eventInfo?.startAt"
          :date="eventInfo?.startAt"
          light
        />
      </div>

      <Transition name="slide-fade-left" appear mode="out-in">
        <template v-if="!alreadyCalled">
          <div class="queue-info">
            <div class="queue-message">
              Olá {{ participantInfo?.participant?.name }}!<br />
              <span style="font-size: 16px"
                >Acompanhe aqui a sua posição em tempo real! Você está na
                posição:</span
              >
            </div>
            <div class="queue-position">{{ participantInfo?.position }}</div>
          </div>
        </template>
        <template v-else>
          <div class="queue-info called">
            <div class="queue-message">
              Chegou a sua vez!<br />
              <span style="font-size: 16px">
                {{ participantInfo?.participant?.name }}, dirija-se para o local
                indicado para realizar sua doação!</span
              >
            </div>
          </div>
        </template>
      </Transition>
    </div>

    <footer class="footer">
      <NuxtImg
        width="56"
        height="56"
        class="footer-img"
        src="/images/illustrations/blood-brothers.svg"
      />
      <NuxtLink to="https://apoie.hemocione.com.br" target="_blank">
        <p>Quer apoiar o Hemocione? Saiba mais clicando aqui!</p>
      </NuxtLink>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";

definePageMeta({
  layout: "no-scroll-no-padding",
});

const ONE_SECOND = 1000;

const route = useRoute();
const router = useRouter();
const { queueId, participantId } = route.params;
const { eventId } = route.query;

if (!eventId) await navigateTo("/queue/not-found");

const { data: eventInfo } = await useFetch(`/api/v1/event/${eventId}`, {
  method: "GET",
});

if (!eventInfo.value) await navigateTo("/queue/not-found");

useHead({
  title: `Acompanhe sua posição na fila | ${eventInfo.value?.name}`,
});

const { data: participantInfo, refresh } = await useFetch(
  `/api/v1/queue/${queueId}/participant/${participantId}/position`,
  {
    method: "GET",
  },
);

let interval: NodeJS.Timeout | undefined;

const alreadyCalled = computed(() => {
  return participantInfo.value?.position === 0;
});

const startInterval = () => {
  if (!interval) {
    interval = setInterval(async () => {
      await refresh();
      if (!participantInfo.value?.position) {
        clearInterval(interval);
        interval = undefined;
      }
    }, 10 * ONE_SECOND);
  }
};

onMounted(async () => {
  await router.isReady();
  startInterval();
});
</script>

<style scoped>
.main-container {
  width: 100%;
  height: 100%;
  min-height: 93dvh;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
}

.header {
  align-self: stretch;
  height: 40px;
  padding: 0 24px;
  background: #bb0a08;
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
  margin-bottom: 16px;
  width: calc(100% + 32px);
}

.main-image {
  align-self: stretch;
  width: calc(100% + 32px);
}

.content {
  align-self: stretch;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.event-title-container {
  align-self: stretch;
  padding: 0 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
}

.event-logo {
  width: 56px;
  height: 56px;
  object-fit: cover;
}

.event-title {
  flex-grow: 1;
  color: #25282b;
  font-size: 26px;
  font-family: Lato;
  font-weight: 700;
}

.date-box {
  width: 48px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #cacccf;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.month {
  text-align: center;
  color: #bb0a08;
  font-size: 12px;
  font-family: Lato;
  font-weight: 400;
  line-height: 14px;
}

.day {
  text-align: center;
  color: #bb0a08;
  font-size: 18px;
  font-family: Lato;
  font-weight: 500;
}

.queue-info {
  align-self: stretch;
  padding: 16px 24px;
  background: #bb0a08;
  border-radius: 8px;
  border: 2px solid #cacccf;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 0px 16px 8px;
}

.queue-info.called {
  background: var(--hemo-color-success);
}

.queue-message,
.custom-message {
  align-self: stretch;
  color: white;
  font-size: 21px;
  font-family: Lato;
  font-weight: 400;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.queue-position {
  width: 120px;
  height: 120px;
  padding: 16px;
  background: #d87c7f;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 80px;
  font-family: Lato;
  font-weight: 700;
  position: relative;
  z-index: 100;
  align-self: center;
}

.queue-position:before {
  content: "";
  background-color: var(--hemo-color-primary-light);
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  z-index: -1;
  animation: pulse 1.8s infinite;
  border-radius: 50%;
}

.event-details {
  align-self: stretch;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title {
  color: #25282b;
  font-size: 22px;
  font-family: Lato;
  font-weight: 600;
}

.description {
  color: #52575c;
  font-size: 16px;
  font-family: Lato;
  font-weight: 400;
  line-height: 20px;
}

.more-info {
  color: #bb0a08;
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
  color: #25282b;
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
  color: #52575c;
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
  background: #e93c3c;
  color: white;
}

.secondary-button {
  background: white;
  border: 1px solid #cacccf;
  color: #52575c;
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
  align-items: center;
  justify-content: center;
  position: sticky;
  left: 0;
  bottom: 0;
  background-color: var(--hemo-color-link);
  width: 100vw;
  padding: 8px 16px;
  gap: 16px;
  flex-direction: row;
  border-top-right-radius: 16px;
  border-top-left-radius: 16px;
  z-index: 2000;
}

@keyframes pulse {
  0% {
    transform: scale(0.7);
    opacity: 1;
  }

  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}
</style>
