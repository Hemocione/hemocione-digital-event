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
    <div
      style="
        height: 50%;
        width: 100%;
        padding: 0.25rem; /* Updated size */
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
        style="height: 80%; object-fit: contain"
        src="/images/logo-padrao.png"
        alt="hemocione-logo"
      />
    </div>
    <div
      style="
        padding: 0.25rem; /* Updated size */
        display: flex;
        flex-direction: column;
        gap: 0.25rem; /* Updated size */
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
          gap: 0.25rem; /* Updated size */
        "
      >
        <h1
          style="
            font-size: 0.75rem; /* Updated size */
            font-weight: bold;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.25rem; /* Updated size */
          "
        >
          <img
            v-if="props.logo"
            style="
              height: 1.5rem; /* Updated size */
              width: 1.5rem; /* Updated size */
              border-radius: 25%;
              border: 0.75px solid #8a0000; /* Updated size */
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
            gap: 0.0625rem; /* Updated size */
            padding: 0.125rem; /* Updated size */
            border-radius: 0.5rem; /* Updated size */
            width: 2rem; /* Updated size */
            height: 2.5rem; /* Updated size */
            text-align: center;
            background-color: #8a0000;
            color: #f2f2f2;
          "
        >
          <span style="font-size: 0.525rem">{{ humanReadableMonth }}</span>
          <span style="font-size: 1.05rem; font-weight: bold">{{ day }}</span>
        </div>
      </div>
      <div
        style="
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          width: 100%;
          padding-left: 0.3rem;
        "
      >
        <div
          v-if="timeText"
          style="display: flex; width: 100%; align-items: center; gap: 0.5rem"
        >
          <img
            style="
              width: 0.75rem; /* Updated size */
              height: 0.75rem; /* Updated size */
              max-width: 0.75rem; /* Updated size */
              color: var(--hemo-color-primary);
            "
            src="/images/icons/calendar.svg"
          />
          <span style="font-size: 0.55rem">
            {{ timeText }}
          </span>
        </div>
        <div
          v-if="addressText"
          style="display: flex; width: 100%; align-items: center; gap: 0.5rem"
        >
          <img
            style="
              width: 0.75rem; /* Updated size */
              height: 0.75rem; /* Updated size */
              max-width: 0.75rem; /* Updated size */
              color: var(--hemo-color-primary);
            "
            src="/images/icons/map-marker.svg"
          />
          <span style="font-size: 0.55rem">
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
