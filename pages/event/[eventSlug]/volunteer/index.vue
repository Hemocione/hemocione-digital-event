<template>
  <main v-if="eventConfig" class="schedules-page">
    <CommonEventHeader :event-name="eventConfig.name" @back="goBack" />
    <!-- <img :src="eventConfig.banner" alt="Event Banner" class="event-banner" /> -->
    <div v-html="eventConfig.externalVolunteers.htmlExplanationText"></div>
    <CommonCoolFooter>
      <ElButton v-for="button in buttons" :key="button.label" :type="button.type" :disabled="button.disabled"
        size="large" @click="button.action">
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
  return eventConfig.externalVolunteers.slots - eventConfig.externalVolunteers.occupiedSlots;
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