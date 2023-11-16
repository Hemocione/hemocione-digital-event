<template>
  <div id="wrapper">
    <div v-if="props.banner" id="banner-wrapper">
      <img id="banner" :src="props.banner" alt="event-banner" fit="cover" />
    </div>
    <div v-else id="hemocione-logo-wrapper">
      <img
        id="hemocione-logo"
        src="/images/logo-padrao.svg"
        alt="hemocione-logo"
      />
    </div>
    <div id="content-wrapper">
      <div id="header">
        <h1 id="title">
          <img v-if="props.logo" id="logo" :src="props.logo" alt="event-logo" />
          {{ props.title }}
        </h1>
        <div v-if="props.startAt" id="date-box">
          <span id="month">{{ humanReadableMonth }}</span>
          <span id="day">{{ day }}</span>
        </div>
      </div>
      <div id="details">
        <div v-if="timeText" id="time">
          <img id="time-icon" src="/images/icons/calendar.svg" />
          <span>
            {{ timeText }}
          </span>
        </div>
        <div v-if="addressText" id="address">
          <img id="address-icon" src="/images/icons/map-marker.svg" />
          <span>
            {{ addressText }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});
const props = defineProps<{
  title: string;
  banner?: string | null;
  description: string;
  addressText: string;
  timeText: string;
  startAt?: string;
  logo?: string | null;
}>();

const monthMinimalText = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
] as const;

const validDate = props.startAt ? new Date(props.startAt) : undefined;

const humanReadableMonth = validDate
  ? monthMinimalText[validDate.getMonth()]
  : undefined;

const day = validDate ? validDate.getDate() : undefined;
</script>

<style scoped>
#title {
  font-size: 3rem;
  font-weight: bold;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}
/* TODO: fix font */
#wrapper {
  position: relative;
  font-family:
    "Roboto",
    monospace,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    "Helvetica Neue",
    Arial,
    "Noto Sans",
    sans-serif;
  background-color: #f2f2f2;
  color: #8a0000;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
#header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
#content-wrapper {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 60%;
  width: 100%;
  margin: 0;
}

#banner {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  object-fit: cover;
  object-position: bottom;
}

#banner-wrapper {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 40%;
}

#date-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border-radius: 1rem;
  width: 4rem;
  height: 5rem;
  text-align: center;
  background-color: #8a0000;
  color: #f2f2f2;
}

#month {
  font-size: 1.5rem;
}

#day {
  font-size: 2.5rem;
  font-weight: bold;
}

#details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

#time-icon,
#address-icon {
  width: 3rem;
  height: 3rem;
  max-width: 3rem;
  color: var(--hemo-color-primary);
}

#logo {
  height: 4rem;
  width: 4rem;
  border-radius: 25%;
  box-shadow: 0 0 1rem rgba(33, 33, 33, 0.2);
  object-fit: contain;
}

#hemocione-logo-wrapper {
  height: 40%;
  width: 100%;
  padding: 1rem;
  background: radial-gradient(
    circle,
    rgba(0, 0, 0, 1) 0%,
    rgba(71, 0, 0, 1) 100%,
    rgba(138, 0, 0, 1) 100%
  );
  background-color: #181313;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 20px solid;
  border-image-slice: 1;
  border-width: 10px;
  border-image-source: linear-gradient(
    90deg,
    rgba(255, 0, 0, 1) 0%,
    rgba(255, 154, 0, 1) 10%,
    rgba(208, 222, 33, 1) 20%,
    rgba(79, 220, 74, 1) 30%,
    rgba(63, 218, 216, 1) 40%,
    rgba(47, 201, 226, 1) 50%,
    rgba(28, 127, 238, 1) 60%,
    rgba(95, 21, 242, 1) 70%,
    rgba(186, 12, 248, 1) 80%,
    rgba(251, 7, 217, 1) 90%,
    rgba(255, 0, 0, 1) 100%
  );
  border-top: 0;
  border-left: 0;
  border-right: 0;
}

#hemocione-logo {
  height: 90%;
  object-fit: contain;
}

#time,
#address {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.7rem;
}

#time span,
#address span {
  font-size: 1.8rem;
}
</style>
