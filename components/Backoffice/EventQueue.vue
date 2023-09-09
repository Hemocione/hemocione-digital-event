<template>
  <el-table
    ref="tableRef"
    :data="participants"
    style="width: 100%"
    lazy
    @selection-change="handleSelectionChange"
    @row-click="handleRowClick"
  >
    <el-table-column v-if="type === 'waiting'" type="selection" />
    <el-table-column property="participant.name" label="Nome" />
    <el-table-column property="participant.phone" label="Telefone">
      <template #default="{ row }">
        <a :href="'tel:' + row.participant.phone">
          {{ row.participant.phone }}
        </a>
      </template>
    </el-table-column>
    <el-table-column v-if="type === 'waiting'" label="Esperando há">
      <template #default="{ row }">
        {{ timeSinceDate(row.createdAt) }}
      </template>
    </el-table-column>
    <el-table-column v-if="type === 'called'" label="Chamado há">
      <template #default="{ row }">
        {{ timeSinceDate(row.calledAt) }}
      </template>
    </el-table-column>
  </el-table>
  <transition name="slide-top">
    <el-button
      v-show="type === 'waiting' && selectedParticipants.length > 0"
      class="bottom-button"
      :disabled="selectedParticipants.length > 3"
      type="success"
      :icon="ElIconDArrowRight"
      :loading="callingParticipants"
      @click="callSelectedParticipants"
    >
      {{ buttonTextComputed }}
    </el-button>
  </transition>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/pt-br";
import type { TableInstance } from "element-plus";
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("pt-br");

interface Participant {
  _id: string;
  participant: {
    phone: string;
    name: string;
  };
  calledAt?: Date | null;
  createdAt?: Date;
}

const props = defineProps<{
  participants: Participant[];
  type: "waiting" | "called";
  queueId: string;
  eventSlug: string;
}>();

const callingParticipants = ref(false);
const emit = defineEmits(["participants-called"]);

function timeSinceDate(date: string) {
  const timeSince = dayjs(date).tz("America/Sao_Paulo").fromNow();
  return timeSince;
}

const tableRef = ref<TableInstance>();

const selectedParticipants = ref<Participant[]>([]);
const handleSelectionChange = (val: Participant[]) => {
  selectedParticipants.value = val;
};

const handleRowClick = (row: Participant) => {
  if (props.type === "waiting") {
    const table = tableRef.value;
    const selected = selectedParticipants.value.some(
      (participant) => participant._id === row._id,
    );
    if (table) {
      table.toggleRowSelection(row, !selected);
    }
  }
};

const callSelectedParticipants = async () => {
  callingParticipants.value = true;
  const selectedParticipantsIds = selectedParticipants.value.map(
    (participant) => participant._id,
  );
  await $fetch(
    `/api/v1/event/${props.eventSlug}/queue/${props.queueId}/participant`,
    {
      method: "POST",
      body: JSON.stringify(selectedParticipantsIds),
    },
  );
  selectedParticipants.value = [];
  callingParticipants.value = false;
  emit("participants-called");
};

const buttonTextComputed = computed(() => {
  const selectedParticipantsLength = selectedParticipants.value.length;
  if (selectedParticipantsLength <= 1) return "Chamar doador";
  return `Chamar ${selectedParticipantsLength} doadores`;
});
</script>

<style scoped>
.bottom-button {
  position: fixed;
  height: 20%;
  width: 100%;
  font-size: 2rem;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  z-index: 1;
}
</style>
