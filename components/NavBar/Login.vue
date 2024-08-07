<template>
  <NuxtLink :to="authUrl" class="auth-button" external>
    <ElButton type="primary" size="small"
      >{{ buttonText }}
      <el-icon class="el-icon--right"
        ><NuxtImg
          src="/images/icons/logout.svg"
          alt="ícone de autenticacao"
          :class="{ mirrored: !Boolean(user) }"
          height="10"
      /></el-icon>
    </ElButton>
  </NuxtLink>
</template>
<script setup lang="ts">
const userStore = useUserStore();
const route = useRoute();
const user = userStore.user;
const config = useRuntimeConfig();
const { hemocioneIdUrl, siteUrl } = config.public;

const authUrl = computed(() => {
  const currentPath = route.fullPath;
  const redirectUrl = new URL(currentPath, siteUrl);
  redirectUrl.searchParams.delete("token"); // ensure no token is passed

  const encodedRedirectUrl = encodeURI(redirectUrl.toString());
  const baseAuthUrl = user ? `${hemocioneIdUrl}/signout` : hemocioneIdUrl;
  return `${baseAuthUrl}?redirect=${encodedRedirectUrl}`;
});

const buttonText = computed(() => {
  return user ? `Sair (${user.givenName.trim()})` : "Entrar";
});
</script>
<style scoped>
.mirrored {
  rotate: 180deg;
}
</style>
