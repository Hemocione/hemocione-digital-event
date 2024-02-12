<template>
  <main class="schedules-page">
    <header>
      <button @click="goBack">A</button>
      <span>Colégio Santo Agostinho 2023</span>
    </header>
    <article>
      <h3>Selecione um horário para a doação:</h3>
      <div class="schedules">
        <CommonCard
          v-for="schedule in state.schedules"
          :key="schedule._id"
          class="schedule-card"
          :focus="isSelected(schedule._id)"
          @click="selectSchedule(schedule._id)"
        >
          <span>10:00</span>
        </CommonCard>
      </div>
    </article>
  </main>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const router = useRouter();

const MOCKED = [
  {
    _id: "1",
    startAt: "2023-10-10T10:00:00.000Z",
    endAt: "2023-10-10T11:00:00.000Z",
    slots: 10,
    occupiedSlots: 5,
  },
  {
    _id: "2",
    startAt: "2023-10-10T11:00:00.000Z",
    endAt: "2023-10-10T12:00:00.000Z",
    slots: 10,
    occupiedSlots: 5,
  },
  {
    _id: "3",
    startAt: "2023-10-10T12:00:00.000Z",
    endAt: "2023-10-10T13:00:00.000Z",
    slots: 10,
    occupiedSlots: 5,
  },
  {
    _id: "4",
    startAt: "2023-10-10T13:00:00.000Z",
    endAt: "2023-10-10T14:00:00.000Z",
    slots: 10,
    occupiedSlots: 5,
  },
  {
    _id: "5",
    startAt: "2023-10-10T14:00:00.000Z",
    endAt: "2023-10-10T15:00:00.000Z",
    slots: 10,
    occupiedSlots: 5,
  },
  {
    _id: "6",
    startAt: "2023-10-10T15:00:00.000Z",
    endAt: "2023-10-10T16:00:00.000Z",
    slots: 10,
    occupiedSlots: 5,
  },
  {
    _id: "7",
    startAt: "2023-10-10T16:00:00.000Z",
    endAt: "2023-10-10T17:00:00.000Z",
    slots: 10,
    occupiedSlots: 5,
  },
  {
    _id: "8",
    startAt: "2023-10-10T17:00:00.000Z",
    endAt: "2023-10-10T18:00:00.000Z",
    slots: 10,
    occupiedSlots: 5,
  },
  {
    _id: "9",
    startAt: "2023-10-10T18:00:00.000Z",
    endAt: "2023-10-10T19:00:00.000Z",
    slots: 10,
    occupiedSlots: 5,
  },
];

const state = reactive({
  schedules: MOCKED,
  selectedScheduleId: null as string | null,
});

function selectSchedule(scheduleId: string) {
  state.selectedScheduleId = scheduleId;
}

function isSelected(scheduleId: string) {
  return state.selectedScheduleId === scheduleId;
}

function goBack() {
  router.back();
}
</script>

<style scoped>
.schedules-page {
  width: 100%;
  min-height: 93dvh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background-color: var(--hemo-color-secondary);
  color: var(--hemo-color-text-secondary);
}

header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  width: 100%;
  height: fit-content;
  border-bottom: 2px solid var(--hemo-color-text-secondary-opaque);
}

article {
  padding: 0 1rem;
  margin-bottom: 1rem;
  width: 100%;
}

h3 {
  font-weight: 500;
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
  align-items: center;
  justify-content: center;
}

@media screen and (max-width: 768px) {
  .schedules {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 480px) {
  .schedules {
    grid-template-columns: 1fr;
  }
}
</style>
