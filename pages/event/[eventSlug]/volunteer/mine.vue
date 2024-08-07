<template>
  <main v-if="eventConfig" class="schedules-page">
    <CommonEventHeader :event-name="eventConfig.name" @back="goBack" />
    <!-- <img :src="eventConfig.banner" alt="Event Banner" class="event-banner" /> -->
    <div class="volunteer-text">
      <h1>Bem vind@, {{ userStore.user.givenName }}!</h1>
      <p>Estamos animados com a sua participação!</p>
      <p>Entre no grupo do WhatsApp para receber mais informações.</p>
      <p>
        Nele você poderá estabelecer contato com a equipe do Hemocione
        responsável e com os outros voluntários!
      </p>
    </div>
    <CommonCoolFooter>
      <ElButton
        v-for="button in buttons"
        :key="button.label"
        :type="button.type"
        :disabled="button.disabled"
        :loading="button.loading"
        size="large"
        @click="button.action"
      >
        {{ button.label }}
      </ElButton>
    </CommonCoolFooter>

    <el-dialog
      style="border-radius: 1rem"
      v-model="dialogVisible"
      width="350"
      align-center
    >
      <span class="dialog-text">Deseja cancelar sua participação?</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">Mudei de ideia</el-button>
          <el-button type="primary" @click="deleteExternalVolunteerFront">
            Cancelar participação
          </el-button>
        </div>
      </template>
    </el-dialog>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import { ref } from "vue";
import { ElMessageBox } from "element-plus";

definePageMeta({
  middleware: ["auth"],
});

const route = useRoute();
const eventStore = useEventStore();
const userStore = useUserStore();
const eventSlug = route.params.eventSlug as string;
const eventConfig = await eventStore.getEvent(eventSlug);
const isVolunteer = await userStore.userIsVolunteer(eventSlug);

const dialogVisible = ref(false);

const handleClose = (done: () => void) => {
  ElMessageBox.confirm("Are you sure to close this dialog?")
    .then(() => {
      done();
    })
    .catch(() => {
      // catch error
    });
};

try {
  if (!isVolunteer) {
    await userStore.createExternalVolunteer(eventSlug);
  }
} catch (e) {
  navigateTo(`/event/${eventSlug}`);
}

interface Button {
  label: string;
  type: "primary" | "default";
  disabled?: boolean;
  visible: boolean;
  action?: () => void;
  loading?: boolean;
}

const userSubscription = await userStore.getSubscription(eventSlug);

const buttons = computed((): Button[] => {
  const computedButtons = [
    {
      label: "Quero me inscrever para doar sangue",
      type: "default",
      visible: eventStore.hasAvailableSlots && !userSubscription,
      action: goToSchedule,
    },
    {
      label: "Cancelar participação como voluntário",
      type: "default",
      visible: true,
      action: () => (dialogVisible.value = true),
      loading: canceling.value,
      disabled: canceling.value,
    },
    {
      label: "Acessar Grupo do WhatsApp",
      type: "primary",
      visible: true,
      action: goToGrupoZap,
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
    navigateTo(groupUrl, { external: true, open: {
      target: "_blank",
      windowFeatures: {
        noopener: true,
        noreferrer: true,
      }
    }});
  }
}

function goToSchedule() {
  navigateTo(`/event/${eventSlug}/schedules`);
}

const canceling = ref(false);

async function deleteExternalVolunteerFront() {
  canceling.value = true;
  dialogVisible.value = false;
  try {
    // await new Promise((r) => setTimeout(r, 2000));
    await userStore.deleteExternalVolunteer(eventSlug);
    navigateTo(`/event/${eventSlug}`);
  } catch (e) {
    ElMessage.error("Ocorreu algum erro ao cancelar a sua participação.");
  }
  canceling.value = false;
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

.dialog-text {
  width: 100%;
}

.confirmation-dialog {
  border-radius: 1rem !important;
}

footer :deep(.el-dialog__footer) {
  padding: 0 !important;
}

.dialog-footer > * {
  flex-grow: 1;
  width: 100%;
}
.dialog-footer {
  width: 100%;
  display: flex;
  gap: 0.5rem;
}

.event-banner {
  width: 100%;
  height: auto;
  margin-bottom: 1rem;
}

.volunteer-text {
  font-family: Arial, sans-serif;
  line-height: 1.5;
  padding: 10px;
  border-left: 4px solid var(--hemo-color-primary);
}

.volunteer-text h1 {
  font-size: 24px;
  color: var(--hemo-color-black-100);
}

.volunteer-text p {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
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
