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
        <ElButton class="default"
          v-if="isAllowedToCancel"
          :loading="state.loading"
          @click="cancelSubscription"
        >
        
          Cancelar agendamento
        </ElButton>
        <ElButton v-if="!isCanDonateMandatory && !hasAnsweredPreScreening" class="default" @click="() => goToCanDonate('event-ticket-adhoc', eventSlug, eventConfig.startAt)" >
         <NuxtImg class="list-image" src="images/list.svg" alt="list icon" height="30" />
          <span class="default"> Verificar se posso doar </span>
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
      <ClientOnly>
      <TicketFooter
        :event-slug="eventSlug"
        :event-name="eventConfig.name"
        :start-at="subscription.schedule.startAt"
        :end-at="subscription.schedule.endAt"
        :address="addressText"
      />
    </ClientOnly>
    <CommonCard class="ticket-card">
  <strong>Posso doar?</strong>

  <template v-if="!hasAnsweredPreScreening">
    <span class="subtext-posso-doar">
      Responda as perguntas mais frequentes sobre doação e descubra se você é elegível para doar sangue
    </span>
    <ElButton
      class="button-posso-doar"
      @click="() => goToCanDonate('event-ticket-adhoc', eventSlug, eventConfig.startAt)"
    >
      <NuxtImg class="list-image" src="images/list.svg" alt="list icon" />
      <span class="button-posso-doar-texto">Verificar se posso doar</span>
    </ElButton>
  </template>

  <template v-else-if="isAbleToDonate">
  <div class="highlight-box">
    <p class="subtext-posso-doar">
      Suas últimas respostas no questionário indicam que você pode estar elegível para a doação.
      Uma triagem será realizada por profissionais de saúde no dia e no local da doação para confirmar sua elegibilidade.
    </p>
    <p class="subtext-posso-doar">
      <span class="status-dot-green"></span>
      Última resposta em {{ lastAnsweredAt }}
    </p>
  </div>

  <ElButton
    class="default"
    @click="() => goToCanDonate('event-ticket-adhoc', eventSlug, eventConfig.startAt)"
  >
    <NuxtImg class="list-image" src="images/list.svg" alt="list icon" />
    <span>Verificar novamente</span>
  </ElButton>
</template>


  <template v-else>
    <div class="highlight-box">
    <span class="subtext-posso-doar">
    Suas últimas respostas no questionário indicam que você pode <strong> não </strong> estar elegível para a doação. Para mais informações sobre sua elegibilidade, consulte um banco de sangue ou tire suas dúvidas com o <u>Hemocione</u>.
    </span>
    <div class="subtext-posso-doar">   
      <span class="status-dot"></span>
      Última resposta em {{ lastAnsweredAt }}</div>
      </div>
    <ElButton
      class="default"
      @click="() => goToCanDonate('event-ticket-adhoc', eventSlug, eventConfig.startAt)"
    >
      <NuxtImg class="list-image" src="images/list.svg" alt="list icon" />
      <span>Verificar novamente</span>
    </ElButton>
  </template>
</CommonCard>
    </article>
  </main>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import dayjs from "dayjs";
import { formatTimeDuration, formatAddress } from "~/helpers/formatter";
import { openSignosChat } from "~/plugins/signos.client";
import { goToCanDonate } from "~/utils/goToCanDonate";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const eventStore = useEventStore();
const userStore = useUserStore();
const eventSlug = route.params.eventSlug as string;
const eventConfig = await eventStore.getEvent(eventSlug);
const subscription = await userStore.getSubscription(eventSlug);

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

const lastAnsweredAt = computed(() => {
  const date = subscription?.lastQuestionnairePreScreening?.answeredAt;
  return date ? dayjs(date).format("DD/MM/YYYY [às] HH:mm") : "Data não disponível";
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

const isCanDonateMandatory = computed(() => {
  const config = eventConfig?.preScreening;
  return config && !config.disabled && config.mandatory;
});

const hasAnsweredPreScreening = computed(() => {
  const screening = subscription?.lastQuestionnairePreScreening;
  return !!(screening && screening.status && screening.answeredAt);
});

const isAbleToDonate = computed(() => {
  const screening = subscription?.lastQuestionnairePreScreening;

  return screening?.status === "able-to-donate";
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

onMounted(() => {
  // Open the Signos chat after a delay. Uncomment when it doenst make the page buggy
  // setTimeout(() => {
  //   openSignosChat();
  // }, SIGNOS_FEEDBACK_DELAY);
});
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

.subtext-posso-doar {
  color: var(--hemo-color-black-80);
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 8px;
  border-radius: 50%;
  background-color: var(--hemo-color-warn); 
  box-shadow: 0 0 4px var(--hemo-color-warn); 
  vertical-align: middle;
}

.status-dot-green {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 8px;
  border-radius: 50%;
  background-color: var(--hemo-color-success); 
  box-shadow: 0 0 4px var(--hemo-color-success); 
  vertical-align: middle;
}

article {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.button-posso-doar {
  background-color: var(--hemo-color-primary-medium);
}

.button-posso-doar-texto {
  color: var(--hemo-color-white); 
}

.highlight-box {
  background-color: var(--hemo-color-gray); 
  padding-left: 1rem;
  padding-right: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
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

.default{ 
  height: 40px; 
}

@media screen and (min-width: 1080px) {
  .ticket-page {
    border-radius: 8px;
  }
}
</style>
