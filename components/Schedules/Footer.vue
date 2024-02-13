<template>
  <CommonCoolFooter height="fit-content" desktop-border-radius="0">
    <ElButton
      type="primary"
      size="large"
      :loading="state.loading"
      @click="selectSchedule"
    >
      Confirmar
    </ElButton>
  </CommonCoolFooter>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const props = defineProps({
  eventSlug: {
    type: String,
    required: true,
  },
  selectedScheduleId: {
    type: String as PropType<string | null>,
    default: null,
  },
});

const state = reactive({
  loading: false,
});

async function selectSchedule() {
  if (!props.selectedScheduleId) {
    ElNotification({
      title: "Horário não selecionado",
      message: "Selecione um horário para continuar.",
      type: "error",
    });

    return;
  }

  state.loading = true;

  try {
    await fetchWithAuth(`/api/v1/event/${props.eventSlug}/subscription`, {
      method: "POST",
      body: {
        scheduleId: props.selectedScheduleId,
        startAt: new Date().toISOString(),
        endAt: new Date().toISOString(),
      },
    });
    navigateTo(`/event/${props.eventSlug}/ticket`);
  } catch (error) {
    ElNotification({
      title: "Erro ao selecionar o horário",
      message: "Tente novamente mais tarde.",
      type: "error",
    });
  }

  state.loading = false;
}
</script>

<style scoped>
button {
  height: 48px;
}
</style>
