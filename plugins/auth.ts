import { evaluateCurrentLogin } from "~/middleware/auth"

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:beforeMount', async () => {
    const route = useRoute()
    await evaluateCurrentLogin(route.query)
    // remove token from url
    const url = new URL(window.location.href)
    url.searchParams.delete('token')
    window.history.replaceState({}, document.title, url.toString())
  })
})