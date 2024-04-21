<template>
  <CommonCoolFooter height="fit-content" desktop-border-radius="0">
    <ElButton type="default" size="large" @click="goToCalendar"
      >Adicionar ao Calendário
      <el-icon class="el-icon--right" size="30"
        ><NuxtImg
          src="/images/icons/google_calendar_icon.svg"
          height="30" /></el-icon
    ></ElButton>
    <ElButton
      type="primary"
      size="large"
      :loading="sharing"
      @click="shareEvent"
    >
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
const sharing = ref(false);

const calendarUrl = getEventGoogleCalendarUrl(calendarEvent);
function goToCalendar() {
  navigateTo(calendarUrl, {
    external: true,
    open: {
      target: "_blank",
    },
  });
}

async function shareEvent() {
  sharing.value = true;
  console.log("shareEvent");
  try {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/event/${props.eventSlug}`;
    const data = {
      title: `Hemocione - ${props.eventName}`,
      text: "Estou participando de um evento Hemocione! Venha comigo!",
      url,
    };
    const instagramImageUrl = `${url}/share/instagram/__og_image__/og.png`;
    console.log({ data, instagramImageUrl });
    const instagramImageFileBlob = await fetch(instagramImageUrl).then((res) =>
      res.blob(),
    );
    console.log({ instagramImageFileBlob });
    const instagramImageFile = new File(
      [instagramImageFileBlob],
      "instagram.png",
      {
        type: "image/png",
      },
    );
    const dataWithImage = {
      ...data,
      files: [instagramImageFile],
    };
    const navigatorShareable = Boolean(navigator.canShare);

    if (navigatorShareable && navigator.canShare(dataWithImage)) {
      await navigator.share(dataWithImage);
    } else if (navigatorShareable && navigator.canShare(data)) {
      await navigator.share(data);
    } else {
      navigator.clipboard.writeText(url);
      ElMessage({
        message: "O link do evento foi copiado para a área de transferência.",
        type: "success",
      });
    }
  } catch (error) {
    ElMessage({
      message: "Não foi possível compartilhar o evento.",
      type: "error",
    });
  } finally {
    sharing.value = false;
  }
}
</script>

<style scoped>
button {
  height: 48px;
}
</style>
