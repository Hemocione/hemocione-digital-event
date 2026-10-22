import {
  hemarcioContextFor,
  shouldShowHemarcioBubble,
} from "~/utils/hemarcioBubble";
import {
  createHemarcioController,
  createSdkLoader,
  resolveIframed,
} from "~/utils/hemarcioController";

const SDK_URL = "https://chat.hemocione.com.br/sdk/0.1.1/hemocione-sdk.js";

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

  const controller = createHemarcioController({
    getRoute: () => router.currentRoute.value,
    isVisible: (route) =>
      shouldShowHemarcioBubble({
        enabled: config.hemarcioEnabled as string,
        iframed,
        path: route.path,
      }),
    buildContext: (route) => hemarcioContextFor(route.path, route.params),
    loadSdk: createSdkLoader(SDK_URL),
    chatUrl: config.hemarcioChatUrl as string,
    chatOptions: { offset: resolveOffset() },
  });

  nuxtApp.hook("app:mounted", controller.sync);
  router.afterEach(() => {
    if (nuxtApp.isHydrating) return;
    void controller.sync();
  });
});
