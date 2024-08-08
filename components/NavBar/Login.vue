<template>
  <NavBarAuthButton
    v-if="loggedIn"
    :button-text="buttonText"
    :logged-in="loggedIn"
    @click="signOut"
  />
  <NuxtLink v-else :to="authUrl" class="auth-button" external>
    <NavBarAuthButton :button-text="buttonText" :logged-in="loggedIn" />
  </NuxtLink>
</template>
<script setup lang="ts">
const userStore = useUserStore();
const route = useRoute();
const user = computed(() => userStore.user);
const loggedIn = computed(() => userStore.loggedIn);
const config = useRuntimeConfig();
const { hemocioneIdUrl, siteUrl } = config.public;

const authUrl = computed(() => {
  const currentPath = route.fullPath;
  const redirectUrl = new URL(currentPath, siteUrl);
  redirectUrl.searchParams.delete("token"); // ensure no token is passed
  const encodedRedirectUrl = encodeURI(redirectUrl.toString());
  return `${hemocioneIdUrl}?redirect=${encodedRedirectUrl}`;
});

const signOut = () => {
  userStore.signOut();
};

const buttonText = computed(() => {
  return user.value ? `Sair (${user.value?.givenName?.trim()})` : "Entrar";
});
</script>
