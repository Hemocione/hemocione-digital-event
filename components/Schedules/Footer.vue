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

const userStore = useUserStore();

const props = defineProps({
  eventSlug: {
    type: String,
    required: true,
  },
  selectedScheduleId: {
    type: String as PropType<string | null>,
    default: null,
  },
  formResponseId: {
  type: String as PropType<string | undefined>,
  default: undefined,
  },
  status: {
    type: String as PropType<"able-to-donate" | "unable-to-donate" | undefined>,
    default: undefined,
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
    await userStore.createSubscription(
      props.eventSlug,
      props.selectedScheduleId,
      props.formResponseId,
      props.status,
    );
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
