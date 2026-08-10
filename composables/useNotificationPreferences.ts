import type { NotificationChannel } from "~/server/models/notificationPreference";

export interface NotificationPreference {
  hemocioneId: string;
  channels: {
    push: { enabled: boolean; token: string | null };
    whatsapp: { enabled: boolean; phone: string | null };
    email: { enabled: boolean; address: string | null };
    sms: { enabled: boolean; phone: string | null };
  };
  eventReminderHours: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateNotificationPreferenceDTO {
  channels?: {
    push?: { enabled?: boolean; token?: string };
    whatsapp?: { enabled?: boolean; phone?: string };
    email?: { enabled?: boolean; address?: string };
    sms?: { enabled?: boolean; phone?: string };
  };
  eventReminderHours?: number[];
}

export const useNotificationPreferences = () => {
  const preferences = ref<NotificationPreference | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchPreferences() {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await $fetch<NotificationPreference>("/api/v1/notifications/preferences");
      preferences.value = data;
      return data;
    } catch (err: any) {
      error.value = err.message || "Erro ao carregar preferências";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updatePreferences(dto: UpdateNotificationPreferenceDTO) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await $fetch<NotificationPreference>("/api/v1/notifications/preferences", {
        method: "PUT",
        body: dto,
      });
      preferences.value = data;
      ElMessage.success("Preferências atualizadas com sucesso!");
      return data;
    } catch (err: any) {
      error.value = err.message || "Erro ao atualizar preferências";
      ElMessage.error(error.value);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function toggleChannel(channel: NotificationChannel) {
    if (!preferences.value) return;

    const newEnabled = !preferences.value.channels[channel].enabled;
    updatePreferences({
      channels: {
        [channel]: {
          enabled: newEnabled,
        },
      },
    });
  }

  function isChannelEnabled(channel: NotificationChannel): boolean {
    return preferences.value?.channels[channel].enabled ?? true;
  }

  return {
    preferences,
    isLoading,
    error,
    fetchPreferences,
    updatePreferences,
    toggleChannel,
    isChannelEnabled,
  };
};
