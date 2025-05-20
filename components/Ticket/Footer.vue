<template>
  <!-- <CommonCoolFooter height="fit-content" desktop-border-radius="0"> -->
    <ElButton type="default" size="large" @click="goToCalendar"
      >Adicionar ao Calendário
      <el-icon class="el-icon--right" size="30"
        ><NuxtImg
          src="/images/icons/google_calendar_icon.svg"
          height="30" /></el-icon
    ></ElButton>
    <ElButton type="default" size="large" @click="toggleShareDrawer">
      Compartilhar evento
    </ElButton>
  <!-- </CommonCoolFooter> -->
  <ElDrawer
    v-model="shareDrawerVisible"
    direction="btt"
    title="Compartilhar evento"
    size="100%"
    class="share-drawer"
  >
    <div class="share-wrapper">
      <img
        v-if="instagramImageLocalUrl"
        :src="instagramImageLocalUrl"
        alt="Instagram Share Image"
        class="instagram-image"
      />
      <div class="medias">
        <div class="media-wrapper" @click="() => shareEvent(true)">
          <img src="/images/social/instagram.svg" alt="Instagram" />
          <span>Stories</span>
        </div>
        <NuxtLink :to="zapUrl" external target="_blank" class="media-wrapper">
          <img src="/images/social/zap.svg" alt="Whatsapp" />
          <span>WhatsApp</span>
        </NuxtLink>
        <div class="media-wrapper" @click="() => shareEvent(false)">
          <img src="/images/icons/more.svg" alt="Outro" />
          <span>Outro</span>
        </div>
      </div>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
import { useHemocioneSdk } from "~/composables/useHemocioneSdk";

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

const shareDrawerVisible = ref(false);

function toggleShareDrawer() {
  shareDrawerVisible.value = !shareDrawerVisible.value;
}

const baseUrl = window.location.origin;
const instagramImageUrl = `${baseUrl}/__og-image__/image/event/${props.eventSlug}/share/instagram/og.png`;

const instagramImageBlob = ref<Blob | null>(null);
const instagramImageLocalUrl = ref<string | null>(null);

onMounted(async () => {
  instagramImageBlob.value = await fetch(instagramImageUrl).then((res) =>
    res.blob(),
  );
  if (!instagramImageBlob.value) return;

  instagramImageLocalUrl.value = URL.createObjectURL(instagramImageBlob.value);
});

const shareText = `Vou participar do evento "${props.eventName}" do Hemocione! Vamos juntos?`;
const shareUrl = `${baseUrl}/event/${props.eventSlug}`;

const zapUrl = getWhatsappUrl(shareText, shareUrl);

async function shareEvent(withImage: boolean = false) {
  try {
    const data: {
      title: string;
      text: string;
      url: string;
      files?: File[];
    } = {
      title: `Hemocione - ${props.eventName}`,
      text: "Estou participando de um evento Hemocione! Venha comigo!",
      url: shareUrl,
    };

    if (withImage && instagramImageBlob.value) {
      const instagramImageFile = new File(
        [instagramImageBlob.value],
        "instagram.png",
        {
          type: "image/png",
        },
      );
      data.files = [instagramImageFile];
    }

    await useHemocioneSdk()?.share(data);
    shareDrawerVisible.value = false;
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
  height: 40px;
}

.share-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem 1rem 1rem;
  gap: 2rem;
  width: 100%;
  height: 100%;
}

.instagram-image {
  max-width: 80%;
  object-fit: contain;
  border-radius: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  max-height: 80%;
}

.medias {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}

.medias img {
  height: 3rem;
}

.media-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex-grow: 1;
  font-size: 0.8rem;
  justify-content: space-between;
  cursor: pointer;
}
</style>
