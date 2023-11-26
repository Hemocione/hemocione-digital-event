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
      height: 100%;
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
        position: relative;
      "
    >
      <img
        style="width: 90%; object-fit: contain; max-height: 90%"
        src="/images/logo-padrao.png"
        alt="hemocione-logo"
      />
      <div
        style="
          width: 110%;
          overflow-x: hidden;
          height: 6px;
          background: linear-gradient(
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
          position: absolute;
          bottom: 0;
          left: 0;
        "
      ></div>
    </div>
    <div
      style="
        padding: 1rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
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
          justify-content: space-around;
          gap: 1rem;
        "
      >
        <div
          style="
            font-size: 3rem;
            font-weight: bold;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 80%;
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
          <h1 style="font-size: 3rem; font-weight: bold; margin: 0">
            {{ props.title }}
          </h1>
        </div>
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
      <div
        style="
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        "
      >
        <span
          style="
            margin: 0;
            font-size: 1.5rem;
            margin-right: 0.5rem;
            font-weight: bold;
          "
        >
          Doe sangue e ajude a salvar até 4 vidas!
        </span>
        <img
          v-for="i in 4"
          :key="i"
          style="width: 3rem; height: 3rem; max-width: 3rem; color: #bb0a08"
          src="/images/icons/pulsating-heart.svg"
        />
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
