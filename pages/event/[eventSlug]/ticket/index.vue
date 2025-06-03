<template>
  <main v-if="eventConfig && subscription" class="ticket-page">
    <CommonEventHeader :event-name="eventConfig.name" @back="goBack" />
    <article>
      <CommonCard class="ticket-card">
        <span class="ticket-code">#{{ subscription.code }}</span>
        <span>{{ subscription.name }}</span>
        <section class="schedule-time">
          <span
            >Horário previsto para doação:
            <strong>{{ ticketStartAt }}</strong></span
          >
        </section>
        <ElButton
          v-if="isAllowedToCancel"
          :loading="state.loading"
          @click="cancelSubscription"
        >
          Cancelar agendamento
        </ElButton>
      </CommonCard>
      <EventsDisclaimer />
      <section class="event-info-container">
        <span>Informações do evento</span>
        <span>
          <strong>{{ eventConfig.name }}</strong>
        </span>
        <EventsInfo :address-text="addressText" :time-text="timeText" />
      </section>
    </article>
    <ClientOnly>
      <TicketFooter
        :event-slug="eventSlug"
        :event-name="eventConfig.name"
        :start-at="subscription.schedule.startAt"
        :end-at="subscription.schedule.endAt"
        :address="addressText"
      />
    </ClientOnly>
  </main>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import dayjs from "dayjs";
import { formatTimeDuration, formatAddress } from "~/helpers/formatter";
import { openSignosChat } from "~/plugins/signos.client";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const eventStore = useEventStore();
const userStore = useUserStore();
const eventSlug = route.params.eventSlug as string;
const eventConfig = await eventStore.getEvent(eventSlug);
const subscription = await userStore.getSubscription(eventSlug);

const questionnaireId = route.query.questionnaireId as string | undefined;
const status = route.query.status as "able-to-donate" | "unable-to-donate" | undefined;

if (!eventConfig) {
  navigateTo("/404");
}

if (!subscription) {
  navigateTo(`/event/${eventSlug}`);
}

useServerSeoMeta({
  title: `Agendamento - ${eventConfig?.name}`,
});

const state = reactive({
  loading: false,
});

const isAllowedToCancel = computed(() => {
  if (!subscription) return false;

  const startAt = dayjs(subscription.schedule.startAt);
  const now = dayjs();

  return now.isBefore(startAt);
});

const ticketStartAt = computed(() => {
  if (!subscription) return "";

  return dayjs(subscription.schedule.startAt).format("HH:mm");
});

const timeText = computed(() => {
  if (!eventConfig.startAt) return "";

  return formatTimeDuration(eventConfig.startAt, eventConfig.endAt);
});

const addressText = computed(() => {
  if (!eventConfig.location) return;

  return formatAddress(eventConfig.location);
});

async function cancelSubscription() {
  state.loading = true;

  try {
    await userStore.cancelSubscription(eventSlug);
    goBack();
  } catch (error) {
    ElNotification({
      title: "Erro ao cancelar agendamento",
      message: "Por favor, tente novamente mais tarde.",
      type: "error",
    });
  }

  state.loading = false;
}

function goBack() {
  navigateTo(`/event/${eventSlug}`);
}

const SIGNOS_FEEDBACK_DELAY = 3000; // 3 seconds

onMounted(async () => {
  if (questionnaireId && status) {
    await userStore.updateSubscriptionPreScreening(
      eventSlug,
      questionnaireId,
      status
    );
  }
});

// onMounted(() => {
  // Open the Signos chat after a delay. Uncomment when it doenst make the page buggy
  // setTimeout(() => {
  //   openSignosChat();
  // }, SIGNOS_FEEDBACK_DELAY);
// });
</script>

<style scoped>
.ticket-page {
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

.ticket-code {
  color: var(--hemo-color-black-80);
  font-size: 0.875rem;
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
