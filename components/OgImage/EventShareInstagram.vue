<template>
  <div
    style="
      position: relative;
      background-color: #fce6e8;
      color: #25282b;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
    "
  >
    <div
      style="
        height: 70%;
        width: 100%;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 32px;
      "
    >
      <div
        v-for="i in 3"
        :key="i"
        style="
          display: flex;
          gap: 32px;
          opacity: 0.25;
          height: 33%;
          padding: 32px;
        "
      >
        <img
          v-for="ind in 5"
          :key="ind"
          src="/images/icons/hemologo-tracejado.svg"
          style="width: 20%; height: 100%; object-fit: contain"
        />
      </div>
      <div
        style="
          width: 100%;
          display: flex;
          justify-content: center;
          position: absolute;
          bottom: 0;
        "
      >
        <img src="/images/illustrations/amizade.svg" style="width: 80%" />
      </div>
    </div>
    <div
      style="
        height: 30%;
        width: 100%;
        padding: 50px;
        border: 5px solid #bb0a08;
        border-radius: 75px 75px 0 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        position: relative;
      "
    >
      <h1 style="color: #bb0a08">DOE SANGUE, SALVE VIDAS</h1>
      <div style="display: flex; gap: 1rem; width: 100%">
        <div
          v-if="props.startAt"
          style="
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 0.25rem;
            padding: 0.5rem;
            border-radius: 1rem;
            width: 5rem;
            height: 7rem;
            text-align: center;
            background-color: #8a0000;
            color: #f2f2f2;
          "
        >
          <span style="font-size: 1.5rem">{{ humanReadableMonth }}</span>
          <span style="font-size: 3rem; font-weight: bold">{{ day }}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem">
          <h1>{{ title }}</h1>
          <p>{{ addressText }}</p>
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
  addressText: string;
  startAt: string;
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
