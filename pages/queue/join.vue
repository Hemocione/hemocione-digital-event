<script setup lang="ts">
const route = useRoute();
const query = route.query;
const { event, eventRef, leadId, uuid } = query;
const shouldRedirect = !event || !leadId || !uuid;

const initialPhone = String(eventRef).startsWith("+55")
  ? String(eventRef)
  : `+55${eventRef}`;

if (shouldRedirect) await navigateTo("/queue/not-found");

const { data: eventConfig } = shouldRedirect
  ? { data: undefined }
  : useFetch(`/api/v1/event/${event}`);

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
  };
  try {
    const queueId = eventConfig?.value?.queue?._id;
    if (!queueId) throw new Error("Queue not found");

    buttonLoading.value = true;
    await $fetch(`/api/v1/event/${event}/queue/${queueId}/participant`, {
      method: "POST",
      body: JSON.stringify(payload),
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

  await navigateTo(
    `https://estande-digital.layers.digital/leadIntent/?leadId=${leadId}&uuid=${uuid}`,
    { external: true },
  );
}
</script>

<template>
  <transition name="slide-fade-down" mode="out-in" appear>
    <div class="page">
      <h1>{{ eventConfig?.name || event }}</h1>
      <el-form :model="form" class="form-wrapper">
        <el-form-item size="large" class="form-item">
          <el-input
            v-model="form.phone"
            :prefix-icon="ElIconPhone"
            placeholder="Telefone"
            max-length="14"
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
            @click="onSubmit"
          >
            Entrar na fila de Doação!<el-icon
              v-show="!buttonLoading"
              class="el-icon--right"
            >
              <el-icon-d-arrow-right />
            </el-icon>
          </el-button>
        </el-form-item>
      </el-form>
      <div class="ofered-by">
        <img src="/images/logo-horizontal-branca.svg" class="logo hemocione" />
        <el-icon size="large">
          <el-icon-plus />
        </el-icon>
        <img src="/images/logo-layers.svg" class="logo" />
      </div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
.page {
  background-color: $color-primary;
  text-align: center;
  padding: 2rem;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
}

.page h1 {
  margin: 0;
}

.form-item {
  width: 100%;
  margin-bottom: 0;
}

.form-wrapper {
  background-color: $color-secondary;
  padding: 1rem;
  border-radius: 1rem;
  width: 100%;
  gap: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hemocione {
  padding-bottom: 5px;
}

.join-item {
  margin-bottom: 0;
}

.logo {
  width: 60%;
}

.ofered-by {
  display: flex;
  gap: 1rem;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: stretch;
}
</style>
