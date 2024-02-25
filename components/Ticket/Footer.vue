<template>
  <CommonCoolFooter height="fit-content" desktop-border-radius="0">
    <ElButton type="default" size="large" @click="goToCalendar"
      >Adicionar ao Calendário
      <el-icon class="el-icon--right" size="30"
        ><NuxtImg src="/images/icons/google_calendar_icon.svg" height="30" /></el-icon
    ></ElButton>
    <ElButton type="primary" size="large" @click="shareEvent">
      Compartilhar evento
    </ElButton>
  </CommonCoolFooter>
</template>

<script setup lang="ts">
const props = defineProps({
  eventSlug: {
    type: String,
    required: true,
  },
  eventName: {
    type: String,
    required: true,
  },
  startAt: {
    type: String,
    required: true,
  },
  endAt: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: false,
    default: "",
  },
});

const calendarEvent = {
  location: props.address,
  startAt: props.startAt,
  endAt: props.endAt,
  eventName: props.eventName,
  eventSlug: props.eventSlug,
};

const calendarUrl = getEventGoogleCalendarUrl(calendarEvent);
function goToCalendar() {
  navigateTo(calendarUrl, {
    external: true,
    open: {
      target: "_blank",
    },
  });
}

function shareEvent() {
  const baseUrl = window.location.origin;
  const url = `${baseUrl}/event/${props.eventSlug}`;

  if (navigator.share) {
    navigator.share({
      title: `Hemocione - ${props.eventName}`,
      text: "Estou participando de um evento Hemocione! Venha comigo!",
      url,
    });

    return;
  }

  navigator.clipboard.writeText(url);
  ElNotification({
    title: "Link copiado",
    message: "O link do evento foi copiado para a área de transferência.",
    type: "success",
  });
}
</script>

<style scoped>
button {
  height: 48px;
}
</style>
