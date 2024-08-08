<template>
  <ElButton type="primary" size="small"
    >{{ buttonText }}
    <el-icon class="el-icon--right"
      ><NuxtImg
        :src="loggedIn ? '/images/icons/logout.svg' : '/images/icons/login.svg'"
        alt="ícone de autenticacao"
        height="10"
    /></el-icon>
  </ElButton>
</template>

<script setup lang="ts">
defineProps<{ loggedIn: boolean; buttonText: string }>();
</script>
