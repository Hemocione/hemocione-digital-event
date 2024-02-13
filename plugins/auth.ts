import { evaluateCurrentLogin } from "~/middleware/auth"

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:beforeMount', async () => {
    const route = useRoute()
    await evaluateCurrentLogin(route.query)
  })
})