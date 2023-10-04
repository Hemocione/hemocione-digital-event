<template>
  <div class="tabs-page">
    <el-tabs v-model="activeTab" class="tabs" stretch>
      <el-tab-pane label="Fila de Doação" name="queue">
        <backoffice-event-queue
          :participants="waitingParticipants"
          :queue-id="queueId"
          :event-slug="eventSlug"
          type="waiting"
          :refresh-function="refreshAllParticipants"
        />
      </el-tab-pane>
      <el-tab-pane label="Doadores Chamados" name="called">
        <backoffice-event-queue
          :participants="calledParticipants"
          :queue-id="queueId"
          :event-slug="eventSlug"
          type="called"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
// todo: get event from layers community and layersPortal integration
const eventSlug = String(route.params.eventSlug);
const { data: eventConfig } = await useFetch(`/api/v1/event/${eventSlug}`);
const queueId = String(eventConfig?.value?.queue?._id);

const waitingParticipants = ref<any>([]);
const calledParticipants = ref<any>([]);

const getWaitingParticipants = () =>
  $fetch(`/api/v1/event/${eventSlug}/queue/${queueId}/participant/waiting`);

const getCalledParticipants = () =>
  $fetch(`/api/v1/event/${eventSlug}/queue/${queueId}/participant/called`);

const refreshAllParticipants = async () => {
  waitingParticipants.value = await getWaitingParticipants();
  calledParticipants.value = await getCalledParticipants();
};

const activeTab = ref<"queue" | "called">("queue");
waitingParticipants.value = await getWaitingParticipants();
calledParticipants.value = await getCalledParticipants();
</script>

<style scoped>
.tabs-page {
  min-height: 100%;
  background-color: var(--hemo-color-secondary);
}
.tabs {
  min-height: 100%;
  background-color: var(--hemo-color-secondary);
}

.tabs :deep(.el-tabs__header) {
  position: sticky;
  top: 0px;
  background-color: var(--hemo-color-secondary);
  z-index: 2;
}
</style>
