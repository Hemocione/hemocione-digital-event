<template>
  <NavBarAuthButton
    v-if="loggedIn"
    :button-text="buttonText"
    :logged-in="loggedIn"
    @click="requestSignOut"
  />
  <NuxtLink v-else :to="authUrl" class="auth-button" external>
    <NavBarAuthButton :button-text="buttonText" :logged-in="loggedIn" />
  </NuxtLink>
  <ElDialog
    v-model="dialogVisible"
    :title="buttonText"
    width="300px"
    align-center
  >
    <p>Tem certeza que deseja sair?</p>
    <template #footer>
      <ElButton
        size="large"
        style="width: calc(50% - 0.25rem); margin-right: 0.5rem"
        @click="dialogVisible = false"
        >Cancelar</ElButton
      >
      <ElButton
        size="large"
        type="primary"
        style="width: calc(50% - 0.25rem)"
        @click="signOut"
        >Sair</ElButton
      >
    </template>
  </ElDialog>
</template>
<script setup lang="ts">
const userStore = useUserStore();
const route = useRoute();
const user = computed(() => userStore.user);
const loggedIn = computed(() => userStore.loggedIn);
const config = useRuntimeConfig();
const { hemocioneIdUrl, siteUrl } = config.public;
const dialogVisible = ref(false);

const authUrl = computed(() => {
  const currentPath = route.fullPath;
  const redirectUrl = new URL(currentPath, siteUrl);
  redirectUrl.searchParams.delete("token"); // ensure no token is passed
  const encodedRedirectUrl = encodeURI(redirectUrl.toString());
  const baseAuthUrl = loggedIn.value
    ? `${hemocioneIdUrl}/signout`
    : `${hemocioneIdUrl}`;
  return `${baseAuthUrl}?redirect=${encodedRedirectUrl}`;
});

const requestSignOut = () => {
  dialogVisible.value = true;
};

const signOut = () => {
  dialogVisible.value = false;
  navigateTo(authUrl.value, { external: true });
};

const buttonText = computed(() => {
  return user.value ? `Sair (${user.value?.givenName?.trim()})` : "Entrar";
});
</script>
