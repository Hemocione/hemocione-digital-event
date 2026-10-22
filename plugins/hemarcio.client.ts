import {
  hemarcioContextFor,
  isHemarcioEnabled,
  shouldShowHemarcioBubble,
} from "~/utils/hemarcioBubble";
import {
  createHemarcioController,
  createSdkLoader,
  resolveIframed,
} from "~/utils/hemarcioController";

// ordem de tentativa: o proximo entra no onerror do anterior
const SDK_URLS = ["https://chat.hemocione.com.br/sdk/0.2.0/hemocione-sdk.js"];

// o rodape fixo de inscricao (78px) cobre o canto inferior direito ate 1240px de largura
const FOOTER_CLEARANCE_Y = 86;

function resolveOffset() {
  const narrow = window.matchMedia("(max-width: 1239px)").matches;
  return { x: 16, y: narrow ? FOOTER_CLEARANCE_Y : 16 };
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public;
  const router = useRouter();
  // lido uma vez: ?iframed=true some apos a primeira navegacao
  const iframed = resolveIframed();

  const available = ref(false);
  const controller = createHemarcioController({
    getRoute: () => router.currentRoute.value,
    isVisible: (route) =>
      shouldShowHemarcioBubble({
        enabled: config.hemarcioEnabled as string,
        iframed,
        path: route.path,
      }),
    buildContext: (route) => hemarcioContextFor(route.path, route.params),
    isEnabled: () => isHemarcioEnabled(config.hemarcioEnabled as string),
    loadSdk: createSdkLoader(SDK_URLS),
    chatUrl: config.hemarcioChatUrl as string,
    chatOptions: { offset: resolveOffset() },
  });

  controller.subscribe((value) => {
    available.value = value;
  });

  nuxtApp.hook("app:mounted", controller.sync);
  router.afterEach(() => {
    if (nuxtApp.isHydrating) return;
    void controller.sync();
  });

  return { provide: { hemarcioAsk: { available, ask: controller.ask } } };
});
