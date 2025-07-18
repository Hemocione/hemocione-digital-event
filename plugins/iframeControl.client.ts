export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("app:mounted", async () => {
    const userStore = useUserStore();
    userStore.setIframed(window !== window.top);
  });
});
