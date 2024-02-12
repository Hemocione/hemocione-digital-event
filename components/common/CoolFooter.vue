<template>
  <transition-group name="slide-top">
    <footer v-if="isOpen">
      <div class="wrapper">
        <slot />
      </div>
    </footer>
    <div v-else-if="!hideToggle" class="fake-div">
      <el-icon size="30" class="toggler" @click="isOpen = true">
        <ElIconArrowUp />
      </el-icon>
    </div>
  </transition-group>
</template>

<script setup lang="ts">
const isOpen = ref(true);
defineProps({
  height: {
    type: String,
    default: "12%",
  },
  hideToggle: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
footer {
  border-top: 1px solid var(--black-40);
  position: sticky;
  bottom: 0;
  background-color: white;
  height: v-bind("height");
  width: 100%;
  max-width: var(--app-max-width);
  margin-top: auto;
}
.wrapper {
  position: relative;
  padding: 1em 2em;
  display: flex;
  gap: 1em;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-items: stretch;
}

.fake-div {
  border-top: 1px solid var(--black-40);
  position: fixed;
  bottom: 0;
  background-color: white;
  width: 100%;
  max-width: var(--app-max-width);
}
.toggler {
  position: absolute;
  top: -1.5em;
  left: 1rem;
  cursor: pointer;
  border-radius: 50%;
  background-color: white;
  border: 1px solid var(--black-40);
  padding: 2px;
}
</style>
