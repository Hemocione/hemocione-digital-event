<template>
  <div class="ocean">
    <div class="wave" />
    <div class="wave" />
    <div class="wave" />
    <div class="wave" />
  </div>
</template>

<style scoped>
.ocean {
  height: 30px; /* change the height of the waves here */
  width: 100%;
  overflow-x: hidden;
  position: relative;
}

.wave {
  position: absolute;
  bottom: 0;
  background: url("/images/wave.svg");
  width: 500%;
  height: 100%;
  animation: wave 5s -3s linear infinite;
  transform: translate3d(0, 0, 0);
  transform-origin: bottom;
}

.wave:nth-of-type(2) {
  animation: wave 9s linear infinite;
}

.wave:nth-of-type(3) {
  animation: wave 10s -1s linear infinite;
}

.wave:nth-of-type(3) {
  animation: wave 7s -2s linear infinite;
}

@keyframes wave {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-25%);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
