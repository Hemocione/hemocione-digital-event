<template>
  <section class="event-content">
    <div v-if="timeText" class="event-extra-info">
      <ElIcon class="icon">
        <ElIconCalendar />
      </ElIcon>
      <span class="extra-info-text">
        {{ timeText }}
      </span>
    </div>
    <div v-if="addressText" class="event-extra-info">
      <ElIcon class="icon">
        <ElIconLocation />
      </ElIcon>
      <span class="extra-info-text">
        {{ addressText }}
      </span>
    </div>
    <div v-if="participants" class="event-extra-info">
      <ElIcon class="icon">
        <ElIconUser />
      </ElIcon>
      <span class="extra-info-text">
        <template v-if="participants > 1">
          {{ participants }} participantes confirmados
        </template>
        <template v-else>{{ participants }} participante confirmado</template>
      </span>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps({
  timeText: {
    type: String as PropType<string | null>,
    default: null,
  },
  addressText: {
    type: String as PropType<string | null>,
    default: null,
  },
  participants: {
    type: Number as PropType<number | null>,
    default: null,
  },
});
</script>

<style scoped>
.event-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}
.event-extra-info {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.5rem;
}

.extra-info-text {
  font-size: 1rem;
}

.icon {
  width: 10%;
  max-width: 2rem;
  color: var(--hemo-color-primary);
  font-size: 2rem;
}
</style>
