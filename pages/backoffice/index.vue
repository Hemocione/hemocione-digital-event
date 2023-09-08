<template>
  <el-tabs v-model="activeTab" class="tabs" stretch>
    <el-tab-pane label="Fila" name="queue">
      <backoffice-queue />
    </el-tab-pane>
    <el-tab-pane label="Chamados" name="called">
      <backoffice-queue />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
const route = useRoute();
// todo: get event from layers community and layersPortal integration
const event = String(route.query.eventSlug);
const { data: eventConfig } = useFetch(`/api/v1/event/${event}`);

const queueId = eventConfig?.value?.queue?._id;

const activeTab = ref<"queue" | "called">("queue");
</script>

<style scoped>
.tabs {
  min-height: 100%;
}
</style>
