<template>
  <div class="notification-preferences">
    <h3>Preferências de Notificação</h3>
    
    <ElCard v-loading="isLoading" class="preferences-card">
      <template v-if="preferences">
        <div class="channel-list">
          <h4>Canais de Comunicação</h4>
          
          <div class="channel-item">
            <div class="channel-info">
              <ElIcon :size="20"><ElIconMessage /></ElIcon>
              <span>SMS</span>
              <small>Receba lembretes por mensagem de texto</small>
            </div>
            <ElSwitch
              v-model="preferences.channels.sms.enabled"
              @change="() => toggleChannel('sms')"
            />
          </div>

          <div class="channel-item">
            <div class="channel-info">
              <ElIcon :size="20"><ElIconChatDotRound /></ElIcon>
              <span>WhatsApp</span>
              <small>Receba lembretes pelo WhatsApp</small>
            </div>
            <ElSwitch
              v-model="preferences.channels.whatsapp.enabled"
              @change="() => toggleChannel('whatsapp')"
            />
          </div>

          <div class="channel-item">
            <div class="channel-info">
              <ElIcon :size="20"><ElIconMessageBox /></ElIcon>
              <span>Email</span>
              <small>Receba lembretes por email</small>
            </div>
            <ElSwitch
              v-model="preferences.channels.email.enabled"
              @change="() => toggleChannel('email')"
            />
          </div>

          <div class="channel-item">
            <div class="channel-info">
              <ElIcon :size="20"><ElIconBell /></ElIcon>
              <span>Push Notification</span>
              <small>Receba notificações no navegador/app</small>
            </div>
            <ElSwitch
              v-model="preferences.channels.push.enabled"
              @change="() => toggleChannel('push')"
            />
          </div>
        </div>

        <ElDivider />

        <div class="reminder-settings">
          <h4>Lembretes de Evento</h4>
          <p class="reminder-description">
            Escolha quando deseja receber lembretes antes dos eventos:
          </p>
          
          <ElCheckboxGroup v-model="selectedReminders">
            <ElCheckbox label="24h">24 horas antes</ElCheckbox>
            <ElCheckbox label="2h">2 horas antes</ElCheckbox>
            <ElCheckbox label="1h">1 hora antes</ElCheckbox>
          </ElCheckboxGroup>

          <ElButton
            type="primary"
            @click="saveReminderSettings"
            :loading="isLoading"
            style="margin-top: 1rem"
          >
            Salvar Preferências
          </ElButton>
        </div>
      </template>

      <ElEmpty v-else description="Carregando preferências..." />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { NotificationChannel } from "~/server/models/notificationPreference";

const {
  preferences,
  isLoading,
  fetchPreferences,
  updatePreferences,
  toggleChannel,
} = useNotificationPreferences();

const selectedReminders = ref<string[]>(["24h"]);

const reminderMapping: Record<string, number> = {
  "24h": 24,
  "2h": 2,
  "1h": 1,
};

onMounted(async () => {
  await fetchPreferences();
  // Initialize selected reminders from preferences
  if (preferences.value?.eventReminderHours) {
    selectedReminders.value = preferences.value.eventReminderHours
      .map((h) => {
        const entry = Object.entries(reminderMapping).find(([, val]) => val === h);
        return entry?.[0];
      })
      .filter(Boolean) as string[];
  }
});

async function saveReminderSettings() {
  const hours = selectedReminders.value.map((r) => reminderMapping[r]).filter(Boolean);
  await updatePreferences({
    eventReminderHours: hours,
  });
}

// Wrapper to handle channel toggle with proper typing
function handleChannelToggle(channel: NotificationChannel) {
  toggleChannel(channel);
}
</script>

<style scoped>
.notification-preferences {
  width: 100%;
}

.preferences-card {
  margin-top: 1rem;
}

.channel-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.channel-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: var(--hemo-color-background);
  border-radius: 8px;
}

.channel-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.channel-info .el-icon {
  color: var(--hemo-color-primary);
}

.channel-info small {
  color: var(--hemo-color-text-secondary);
  font-size: 0.85rem;
}

.reminder-settings {
  margin-top: 1rem;
}

.reminder-description {
  color: var(--hemo-color-text-secondary);
  margin-bottom: 1rem;
}

h3 {
  margin: 0 0 1rem 0;
}

h4 {
  margin: 0 0 0.75rem 0;
  color: var(--hemo-color-text-primary);
}

.el-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
