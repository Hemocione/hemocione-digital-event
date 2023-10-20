<template>
  <ul class="latest-donators">
    <TransitionGroup name="list" class="latest-donators">
      <li key="latest-donators-title" class="latest-title-text">
        Últimos Doadores
      </li>
      <li
        v-for="participant in latestCalledParticipants"
        :key="participant._id"
        class="participant"
      >
        <NuxtImg src="/images/logo.svg" alt="logo" class="participant-logo" />
        <span class="latest-participant-name">
          {{ participant.participant.name }}
        </span>
        <span class="latest-participant-description">
          {{ getParticipantDescriptionFromCalled(participant.calledAt) }}
        </span>
      </li>
      <li v-for="index in toCompleteLines" :key="index" class="participant">
        <NuxtImg
          src="/images/logo-grey.svg"
          alt="grey logo"
          class="participant-logo"
        />
        <span class="latest-participant-name-fill"> Aguardando... </span>
        <span class="latest-participant-description"> Aguardando... </span>
      </li>
    </TransitionGroup>
  </ul>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/pt-br";
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("pt-br");

const props = defineProps<{
  latestCalledParticipants: any[];
}>();

function timeSinceDate(date: string) {
  const timeSince = dayjs(date).tz("America/Sao_Paulo").fromNow();
  return timeSince;
}

function getParticipantDescriptionFromCalled(calledAt: string) {
  const timeSince = timeSinceDate(calledAt);
  return `Chamado ${timeSince}`;
}

const toCompleteLines = computed(() =>
  Math.max(0, 10 - props.latestCalledParticipants.length),
);
</script>

<style scoped>
.latest-title-text {
  font-weight: bold;
  color: var(--hemo-color-text-secondary);
  height: 100%;
  padding: 1rem;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
}
.participant {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  width: 100%;
  height: 100%;
  border-top: 2px solid var(--hemo-color-text-secondary-opaque);
}

.participant-logo {
  height: 2rem;
}

.latest-participant-name {
  color: var(--hemo-color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 40%;
}

.latest-participant-name-fill {
  color: var(--hemo-color-text-secondary-opaque);
  font-style: italic;
}

.latest-participant-description {
  color: var(--hemo-color-text-secondary-opaque);
  font-size: 0.8rem;
  margin-left: auto;
  font-style: italic;
}
.latest-donators {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
  border: 2px solid var(--hemo-color-text-secondary-opaque);
  border-radius: 1rem;
}
</style>
