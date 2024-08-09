<template>
  <main v-if="eventConfig" class="schedules-page">
    <CommonEventHeader :event-name="eventConfig.name" @back="goBack" />
    <!-- <img :src="eventConfig.banner" alt="Event Banner" class="event-banner" /> -->
    <div v-html="htmlExplanationText" class="volunteer-text"></div>
    <CommonCoolFooter>
      <ElButton
        v-for="button in buttons"
        :key="button.label"
        :type="button.type"
        :disabled="button.disabled"
        size="large"
        @click="button.action"
      >
        {{ button.label }}
      </ElButton>
    </CommonCoolFooter>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";

const route = useRoute();
const eventStore = useEventStore();
const userStore = useUserStore();
const eventSlug = route.params.eventSlug as string;
const eventConfig = await eventStore.getEvent(eventSlug);
const isVolunteer = await userStore.userIsVolunteer(eventSlug);

interface Button {
  label: string;
  type?: "primary";
  disabled?: boolean;
  visible: boolean;
  action?: () => void;
}

const availableSlots = computed(() => {
  if (!eventConfig.externalVolunteers) return 0;
  return (
    eventConfig.externalVolunteers.slots -
    eventConfig.externalVolunteers.occupiedSlots
  );
});

const buttonText = computed(() => {
  if (isVolunteer) {
    return "Continuar";
  } else if (!availableSlots.value) {
    return "Não há mais vagas no momento, esperamos você em um próximo evento ;)";
  }
  return "Quero ajudar!";
});

const buttons = computed((): Button[] => {
  const computedButtons = [
    {
      label: buttonText.value,
      type: "primary",
      visible: true,
      action: goTovolunteerParaGrupoZap,
      disabled: !isVolunteer && !Boolean(availableSlots.value),
    },
  ];
  return computedButtons.filter((button) => button.visible) as Button[];
});

const htmlExplanationText = computed(() => {
  return (
    eventConfig.externalVolunteers?.htmlExplanationText ||
    `<h1>Fala, voluntário!</h1>
    <p>Estamos muito felizes com o seu interesse em participar mais de perto de um evento do Hemocione. Antes de prosseguir, informamos que os eventos Hemocione costumam durar 5 horas, com um tempinho extra para organizarmos tudo antes e depois.</p>
    <p>Precisamos da sua disponibilidade durante esse horário. Também será realizada uma capacitação no dia anterior ao evento para explicarmos como ele funcionará.</p>
    <p>Caso consiga participar, você poderá receber um certificado pelas suas horas de trabalho voluntário :)</p>
    <p>No entanto, se não for possível no momento, esperamos poder te receber nesse ou em futuros eventos.</p>`
  );
});

if (!eventConfig) {
  navigateTo("/404");
}

function goBack() {
  navigateTo(`/event/${eventSlug}`);
}

function goTovolunteerParaGrupoZap() {
  navigateTo(`/event/${eventSlug}/volunteer/mine`);
}
</script>

<style scoped>
.button {
  height: 48px;
  margin: 0;
}

.schedules-page {
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
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  width: 100%;
}
.volunteer-text {
  font-family: Arial, sans-serif;
  line-height: 1.5;
  padding: 10px;
  border-left: 4px solid var(--hemo-color-primary);
}

.volunteer-text h1 {
  font-size: 24px;
  color: var(--hemo-color-black-100);
}

.volunteer-text p {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
}

.event-banner {
  width: 100%;
  height: auto;
  margin-bottom: 1rem;
}

@media screen and (max-width: 768px) {
  .schedules {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 340px) {
  .schedules {
    grid-template-columns: 1fr;
  }
}

@media screen and (min-width: 1080px) {
  .schedules-page {
    border-radius: 8px;
  }
}
</style>
