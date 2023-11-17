<template>
  <div
    style="
      position: relative;
      background-color: #f2f2f2;
      color: #8a0000;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    "
  >
    <!-- <div
      v-if="props.banner"
      style="padding: 0; margin: 0; width: 100%; height: 40%"
    >
      <img
        style="
          width: 100%;
          height: 100%;
          padding: 0;
          margin: 0;
          object-fit: cover;
          object-position: bottom;
        "
        :src="props.banner"
        alt="event-banner"
        fit="cover"
      />
    </div> -->
    <div
      style="
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
      "
    >
      <img
        style="height: 90%; object-fit: contain"
        src="/images/logo-padrao.png"
        alt="hemocione-logo"
      />
    </div>
    <div
      style="
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: 60%;
        width: 100%;
        margin: 0;
      "
    >
      <div
        style="
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        "
      >
        <h1
          style="
            font-size: 3rem;
            font-weight: bold;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 1rem;
          "
        >
          <img
            v-if="props.logo"
            style="
              height: 6rem;
              width: 6rem;
              border-radius: 25%;
              border: 3px solid #8a0000;
              object-fit: contain;
            "
            :src="props.logo"
            alt="event-logo"
          />
          {{ props.title }}
        </h1>
        <div
          v-if="props.startAt"
          style="
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 0.25rem;
            padding: 0.5rem;
            border-radius: 2rem;
            width: 8rem;
            height: 10rem;
            text-align: center;
            background-color: #8a0000;
            color: #f2f2f2;
          "
        >
          <span style="font-size: 2.1rem">{{ humanReadableMonth }}</span>
          <span style="font-size: 4.2rem; font-weight: bold">{{ day }}</span>
        </div>
      </div>
      <div
        style="display: flex; flex-direction: column; gap: 1rem; width: 100%"
      >
        <div
          v-if="timeText"
          style="display: flex; width: 100%; align-items: center; gap: 1rem"
        >
          <img
            style="
              width: 3rem;
              height: 3rem;
              max-width: 3rem;
              color: var(--hemo-color-primary);
            "
            src="/images/icons/calendar.svg"
          />
          <span style="font-size: 2.2rem">
            {{ timeText }}
          </span>
        </div>
        <div
          v-if="addressText"
          style="display: flex; width: 100%; align-items: center; gap: 1rem"
        >
          <img
            style="
              width: 3rem;
              height: 3rem;
              max-width: 3rem;
              color: var(--hemo-color-primary);
            "
            src="/images/icons/map-marker.svg"
          />
          <span style="font-size: 2.2rem">
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
