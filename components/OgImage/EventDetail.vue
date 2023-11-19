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
        padding: 0.3333rem;
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
        style="width: 80%; object-fit: contain"
        src="/images/logo-padrao.png"
        alt="hemocione-logo"
      />
    </div>
    <div
      style="
        padding: 0.3333rem;
        display: flex;
        flex-direction: column;
        gap: 0.3333rem;
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
          gap: 0.3333rem;
        "
      >
        <h1
          style="
            font-size: 1.3rem;
            font-weight: bold;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 0.3333rem;
          "
        >
          <img
            v-if="props.logo"
            style="
              height: 2rem;
              width: 2rem;
              border-radius: 25%;
              border: 1px solid #8a0000;
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
            gap: 0.0833rem;
            padding: 0.1667rem;
            border-radius: 0.6667rem;
            width: 2.6667rem;
            height: 3.3333rem;
            text-align: center;
            background-color: #8a0000;
            color: #f2f2f2;
          "
        >
          <span style="font-size: 0.7rem">{{ humanReadableMonth }}</span>
          <span style="font-size: 1.4rem; font-weight: bold">{{ day }}</span>
        </div>
      </div>
      <div
        style="
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: 100%;
          padding: 0.3rem 0 0 0.3rem;
        "
      >
        <div
          v-if="timeText"
          style="
            display: flex;
            width: 100%;
            align-items: center;
            gap: 0.3333rem;
          "
        >
          <img
            style="
              width: 1.4rem;
              height: 1.4rem;
              max-width: 1.4rem;
              color: var(--hemo-color-primary);
            "
            src="/images/icons/calendar.svg"
          />
          <span style="font-size: 0.8rem">
            {{ timeText }}
          </span>
        </div>
        <div
          v-if="addressText"
          style="
            display: flex;
            width: 100%;
            align-items: center;
            gap: 0.3333rem;
          "
        >
          <img
            style="
              width: 1.4rem;
              height: 1.4rem;
              max-width: 1.4rem;
              color: var(--hemo-color-primary);
            "
            src="/images/icons/map-marker.svg"
          />
          <span style="font-size: 0.8rem">
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
