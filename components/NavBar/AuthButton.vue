<template>
  <ElButton type="primary" size="small"
    >{{ buttonText }}
    <el-icon class="el-icon--right"
      ><NuxtImg
        src="/images/icons/logout.svg"
        alt="ícone de autenticacao"
        :class="{ mirrored: !loggedIn }"
        height="10"
    /></el-icon>
  </ElButton>
</template>

<script setup lang="ts">
defineProps<{ loggedIn: boolean; buttonText: string }>();
</script>
<style scoped>
.mirrored {
  rotate: 180deg;
}
</style>
