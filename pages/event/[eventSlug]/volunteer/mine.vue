<template>
  <main v-if="eventConfig" class="schedules-page">
    <CommonEventHeader :event-name="eventConfig.name" @back="goBack" />
    <!-- <img :src="eventConfig.banner" alt="Event Banner" class="event-banner" /> -->
    <h1>vai pro grupo do zap</h1>
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
// import {deleteExternalVolunteer} from "~/server/services/externalVolunteer";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const eventStore = useEventStore();
const userStore = useUserStore();
const eventSlug = route.params.eventSlug as string;
const eventConfig = await eventStore.getEvent(eventSlug);
const isVolunteer = await userStore.userIsVolunteer(eventSlug);

try {
    if (!isVolunteer){
    await userStore.createExternalVolunteer(eventSlug); 
  }
}
catch(e){
  navigateTo(`/event/${eventSlug}`);
}


interface Button {
  label: string;
  type: "primary" | "default";
  disabled?: boolean;
  visible: boolean;
  action?: () => void;
}

const buttons = computed((): Button[] => {
  const computedButtons = [
    {
      label: "Cancelar participação como voluntário",
      type: "default",
      visible: true,
      action: deleteExternalVolunteerFront,
    },
    {
      label: "Acessar Zap",
      type: "primary",
      visible: true,
      action: goToGrupoZap
    },
  ];
  return computedButtons.filter((button) => button.visible) as Button[];
});

if (!eventConfig) {
  navigateTo("/404");
}

function goBack() {
  navigateTo(`/event/${eventSlug}/volunteer`);
}

function goToGrupoZap() {
  const groupUrl = eventConfig.externalVolunteers?.groupUrl;
  if (groupUrl) {
    window.location.href = groupUrl;
  } else {
    alert("O link do grupo do Zap não está disponível.");
  }
}

async function deleteExternalVolunteerFront() {
  await userStore.deleteExternalVolunteer(eventSlug);
  navigateTo(`/event/${eventSlug}`);
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