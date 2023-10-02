<script setup lang="ts">
const route = useRoute();
const query = route.query;
const { eventId, eventRef, leadId, uuid } = query;
const shouldRedirect = !eventId;

const initialPhone = String(eventRef).startsWith("+55")
  ? String(eventRef)
  : `+55${eventRef ? String(eventRef) : ""}`;

const disablePhone = initialPhone.length === 14;

if (shouldRedirect) await navigateTo("/queue/not-found");

const { data: eventConfig } = shouldRedirect
  ? { data: undefined }
  : await useFetch(`/api/v1/event/${eventId}`);

const form = ref({
  phone: initialPhone,
  name: "",
});

const buttonLoading = ref(false);

const allowClick = computed(() => {
  const { phone, name } = form.value;
  return phone.length === 14 && name.length > 3;
});

async function onSubmit() {
  const { phone, name } = form.value;
  const payload = {
    phone,
    name,
    leadId,
    uuid,
  };
  try {
    const queueId = eventConfig?.value?.queue?._id;
    if (!queueId) throw new Error("Queue not found");

    buttonLoading.value = true;
    await $fetch(`/api/v1/event/${event}/queue/${queueId}/participant`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    await navigateTo({
      path: "/queue/join/success",
      query: {
        name,
        ...(leadId && uuid ? { leadId, uuid } : {}),
      },
    });
  } catch (error) {
    ElNotification({
      title: "Ops!",
      message:
        "Não foi possível entrar na fila de doação. Por favor, verifique seus dados e tente novamente.",
      type: "error",
    });
  }
  buttonLoading.value = false;
}
</script>

<template>
  <div class="page queue-join-page">
    <h1>{{ eventConfig?.name ?? eventConfig?.slug ?? eventId }}</h1>
    <el-form :model="form" class="form-wrapper">
      <el-form-item size="large" class="form-item">
        <el-input
          v-model="form.phone"
          :prefix-icon="ElIconPhone"
          placeholder="Telefone"
          maxlength="14"
          :disabled="disablePhone"
        />
      </el-form-item>
      <el-form-item size="large" class="form-item">
        <el-input
          v-model="form.name"
          :prefix-icon="ElIconUser"
          placeholder="Insira seu nome"
        />
      </el-form-item>
      <el-form-item size="large" class="form-item join-item">
        <el-button
          class="form-item"
          :disabled="!allowClick"
          type="success"
          :loading="buttonLoading"
          :icon="ElIconArrowRight"
          @click="onSubmit"
        >
          Entrar na fila de Doação!
        </el-button>
      </el-form-item>
    </el-form>
    <div class="offered-by">
      <img src="/images/logo-horizontal-branca.svg" class="logo hemocione" />
    </div>
  </div>
</template>

<style scoped>
.queue-join-page {
  text-align: center;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
}

h1 {
  margin: 0;
}

.form-item {
  width: 100%;
  margin-bottom: 0;
}

.form-wrapper {
  background-color: var(--hemo-color-secondary);
  padding: 1rem;
  border-radius: 1rem;
  width: 100%;
  gap: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hemocione {
  padding-bottom: 2%;
}

.join-item {
  margin-bottom: 0;
}

.logo {
  width: 50%;
}

.plus-icon {
  width: 8%;
}

.offered-by {
  display: flex;
  gap: 1rem;
  flex-direction: column;
  width: 100%;
  align-items: center;
}
</style>
