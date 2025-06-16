<template>
  <main v-if="eventConfig" class="schedules-page">
    <CommonEventHeader :event-name="eventConfig.name" @back="goBack" />
    <article>
      <h3>Selecione um horário para a doação:</h3>
      <EventsDisclaimer />
      <div class="schedules">
        <CommonCard
          v-for="schedule in schedules"
          :key="schedule.id"
          class="schedule-card"
          :class="{ disabled: schedule.disabled }"
          :focus="isSelected(schedule.id)"
          @click="selectSchedule(schedule)"
        >
          <span>{{ schedule.hour }}</span>
          <span v-if="schedule.alert" class="alert">
            {{ schedule.alert }}
          </span>
        </CommonCard>
      </div>
    </article>
    <SchedulesFooter
    :event-slug="eventSlug"
    :selected-schedule-id="state.selectedScheduleId"
    :formResponseId-id="formResponseId"
    :status="status"
  />
  </main>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { computed, reactive } from "vue";
import { isTodayAndPast } from "~/helpers/todayAndPast";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const eventSlug = route.params.eventSlug as string;
const userStore = useUserStore();

const formResponseId = route.query.formResponseId as string | undefined;
const status = route.query.status as "able-to-donate" | "unable-to-donate" | undefined;

const eventStore = useEventStore();
const eventConfig = await eventStore.getEvent(eventSlug);

const subscription = await userStore.getSubscription(eventSlug, {
  formResponseId,
  status
});

if (subscription) {
  navigateTo(`/event/${eventSlug}/ticket`);
}

useServerSeoMeta({
  title: `Horários - ${eventConfig?.name}`,
});

interface Schedule {
  id: string;
  slots: number;
  occupiedSlots: number;
  alert: string | null;
  hour: string;
  disabled: boolean;
}

const PERCENTAGE_THRESHOLD_LAST_SLOTS = 0.2; // 20% of the slots

const state = reactive({
  selectedScheduleId: null as string | null,
});

const IsTimeInPast = (time: string) => {
  const now = new Date();
  const timeDate = new Date(time);
  return now > timeDate;
};

const subscriptionSchedulesInBetweenEventStartAndEnd =
  eventConfig.subscription?.schedules.filter((schedule) => {
    if (
      !schedule.startAt ||
      !schedule.endAt ||
      !eventConfig.startAt ||
      !eventConfig.endAt
    )
      return true;

    const startAt = new Date(schedule.startAt);
    const endAt = new Date(schedule.endAt);
    const eventStartAt = new Date(eventConfig.startAt);
    const eventEndAt = new Date(eventConfig.endAt);
    return startAt >= eventStartAt && endAt <= eventEndAt;
  });

const schedules = computed(() => {
  const subscription = eventConfig.subscription;

  if (!subscription?.enabled) return [];

  return subscriptionSchedulesInBetweenEventStartAndEnd?.map<Schedule>(
    (schedule) => ({
      id: String(schedule._id),
      slots: schedule.slots,
      occupiedSlots: schedule.occupiedSlots,
      alert: getScheduleAlert(schedule.slots, schedule.occupiedSlots),
      hour: dayjs(schedule.startAt).format("HH:mm"),
      disabled:
        schedule.occupiedSlots >= schedule.slots ||
        IsTimeInPast(schedule.startAt),
    }),
  );
});

function selectSchedule(schedule: Schedule) {
  if (schedule.disabled) return;

  state.selectedScheduleId = schedule.id;
}

function getScheduleAlert(slots: number, occupiedSlots: number) {
  if (occupiedSlots >= slots) {
    return "Esgotado";
  }

  if (occupiedSlots / slots >= PERCENTAGE_THRESHOLD_LAST_SLOTS) {
    return "Últimas vagas";
  }

  return null;
}

function isSelected(scheduleId: string) {
  return state.selectedScheduleId === scheduleId;
}

function goBack() {
  navigateTo(`/event/${eventSlug}`);
}
</script>

<style scoped>
.schedules-page {
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

article {
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
  width: 100%;
}

h3 {
  font-weight: 500;
  margin-bottom: 0;
}

.schedules {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
}

.schedule-card {
  padding: 2rem;
  font-size: 22px;
  font-weight: 600;
  cursor: pointer;
  width: 100% !important;
  height: 75px !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.schedule-card.disabled {
  background-color: var(--hemo-color-text-primary);
  color: var(--hemo-color-text-secondary-opaque);
  cursor: not-allowed;
}
.schedule-card.disabled .alert {
  color: var(--hemo-color-text-secondary-opaque);
}

.schedule-card .alert {
  font-size: 12px;
  font-weight: 500;
  color: var(--hemo-color-text-secondary);
  opacity: 0.8;
  text-transform: uppercase;
  padding-top: 4px;
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
