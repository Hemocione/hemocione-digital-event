<script setup lang="ts">
import { useUserStore } from "~/stores/user";
const { user } = useUserStore();
definePageMeta({
  layout: "no-scroll",
});

const route = useRoute();
const query = route.query;
const { eventId, eventRef, leadId, uuid, autoJoin } = query;
const shouldRedirect = !eventId;
const config = useRuntimeConfig();

// TODO: read fbc and fbp -- need to install meta pixel (how?)
// TODO: whatsapp or push notification instead of SMS

const currentUser = user;
const currentUserPhoneWithoutCountryCode = currentUser?.phone
  ? currentUser.phone.replace('+', '')?.slice(2)
  : "";
const initialPhone = eventRef ? String(eventRef) : currentUserPhoneWithoutCountryCode ?? "";
const initialName = currentUser?.givenName
  ? `${currentUser?.givenName} ${currentUser?.surName}`.trim()
  : "";

const disablePhone = Boolean(initialPhone.length === 11);
const disableName = Boolean(initialName.length);

const hemocioneIdIntegrated = Boolean(currentUser);

if (shouldRedirect) await navigateTo("/");

const { data: eventConfig } = shouldRedirect
  ? { data: undefined }
  : await useFetch(`/api/v1/event/${eventId}`);

useHead({
  title: `Fila de Doação Hemocione | ${eventConfig?.value?.name ?? eventId}`,
});
if (!eventConfig?.value) await navigateTo("/");

const form = ref({
  phone: initialPhone,
  name: initialName,
});

const buttonLoading = ref(false);

const allowClick = computed(() => {
  const { phone, name } = form.value;
  return phone.length === 11 && name.length > 2;
});

async function onSubmit() {
  const { phone, name } = form.value;
  const payload: {
    phone: string;
    name: string;
    leadId?: string;
    uuid?: string;
    hemocioneId?: string;
  } = {
    phone,
    name,
    ...(leadId ? { leadId: String(leadId) } : {}),
    ...(uuid ? { uuid: String(uuid) } : {}),
  };

  if (
    hemocioneIdIntegrated &&
    initialName === name &&
    initialPhone === phone &&
    currentUser?.id
  ) {
    payload.hemocioneId = currentUser.id;
  }
  try {
    const queueId = eventConfig?.value?.queue?._id;
    if (!queueId) throw new Error("Queue not found");

    buttonLoading.value = true;
    const queueParticipant = await $fetch(
      `/api/v1/event/${eventId}/queue/${queueId}/participant`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    if (leadId && uuid) {
      await navigateTo({
        path: "/queue/join/success",
        query: {
          name,
          ...(leadId && uuid ? { leadId, uuid } : {}),
        },
      });
    } else {
      await navigateTo({
        path: `/queue/${queueId}/participant/${queueParticipant._id}`,
        query: {
          eventId,
        },
      });
    }
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

function formatPhone(value: string) {
  const ddd = value.slice(0, 2);
  const phoneFirstPart = value.slice(2, 7);
  const phoneSecondPart = value.slice(7);

  if (ddd.length && !phoneFirstPart.length) return `(${ddd}) `;
  if (phoneFirstPart.length && !phoneSecondPart.length)
    return `(${ddd}) ${phoneFirstPart}`;
  if (phoneSecondPart.length)
    return `(${ddd}) ${phoneFirstPart}-${phoneSecondPart}`;

  return value;
}

function parsePhone(value: string) {
  return value.replace(/\D/g, "");
}

const joinQueueText = computed(() => {
  if (hemocioneIdIntegrated)
    return `Entrar na fila de doação como ${currentUser?.givenName}`;
  return `Entrar na fila de doação!`;
});

const hemocioneIdUrl = computed(() => {
  return getHemocioneIdUrl(
    `${config.public.siteUrl}${route.fullPath}&autoJoin=1`,
  );
});

const hemocioneIdButtonText = computed(() => {
  if (hemocioneIdIntegrated)
    return `Não é ${currentUser?.givenName}? Entre com outra conta.`;
  return `Entrar com Hemocione`;
});

const goToHemocioneId = () => {
  window.location.href = hemocioneIdUrl.value;
};

const dividerText = computed(() => {
  if (!hemocioneIdIntegrated) return "Ou entre na fila manualmente";
  return "Ou confirme sua entrada na fila";
});

onMounted(() => {
  if (autoJoin && allowClick) onSubmit();
});
</script>

<template>
  <div class="page queue-join-page">
    <div class="event-header">
      <NuxtImg
        v-if="eventConfig?.logo"
        format="webp"
        :src="eventConfig?.logo"
        class="event-logo"
      />
      <h1>{{ eventConfig?.name ?? eventConfig?.slug ?? eventId }}</h1>
    </div>
    <el-form :model="form" class="form-wrapper">
      <el-form-item size="large" class="form-item">
        <el-button
          class="form-item"
          type="success"
          color="#25282B"
          @click="goToHemocioneId"
        >
          <template #icon>
            <NuxtImg src="/images/logo-white.svg" class="login-logo" />
          </template>
          {{ hemocioneIdButtonText }}
        </el-button>
      </el-form-item>
      <el-divider>{{ dividerText }}</el-divider>
      <el-form-item size="large" class="form-item">
        <el-input
          v-model="form.phone"
          type="tel"
          placeholder="Insira seu telefone com DDD"
          :prefix-icon="ElIconPhone"
          :disabled="disablePhone"
          maxlength="15"
          :formatter="formatPhone"
          :parser="parsePhone"
        />
      </el-form-item>
      <el-form-item size="large" class="form-item">
        <el-input
          v-model="form.name"
          :prefix-icon="ElIconUser"
          :disabled="disableName"
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
          {{ joinQueueText }}
        </el-button>
      </el-form-item>
      <span class="disclaimer">
        Ao entrar na fila de doação, você concorda com os <a href="https://cdn.hemocione.com.br/legal/termos_de_uso.pdf" target="_blank" rel="noopener noreferrer">Termos de Uso</a> e a <a href="https://cdn.hemocione.com.br/legal/politica_de_privacidade.pdf" target="_blank" rel="noopener noreferrer">Política de Privacidade</a> do Hemocione.
      </span>
    </el-form>
  </div>
</template>

<style scoped>
.disclaimer {
  font-size: 0.8rem;
  color: var(--hemo-color-text-secondary);
  text-align: center;
}

.disclaimer a {
  color: var(--hemo-color-primary-light);
  font-weight: bolder;
}
.queue-join-page {
  text-align: center;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 2rem;
  height: 100%;
}

.event-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  color: var(--hemo-color-black-100);
}

.event-logo {
  height: 4rem;
  aspect-ratio: auto;
  border-radius: 25%;
}

h1 {
  margin: 0;
}

.form-item {
  width: 100%;
  margin-bottom: 0;
}

.form-wrapper {
  background-color: var(--hemo-color-white);
  padding: 1rem;
  border-radius: 1rem;
  width: 100%;
  gap: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.join-item {
  margin-bottom: 0;
}

.logo {
  height: 4rem;
}

.plus-icon {
  width: 8%;
}

.offered-by {
  display: flex;
  gap: 1rem;
  width: 100%;
  align-items: center;
  justify-content: space-around;
}

.login-logo {
  height: 100%;
}
</style>
