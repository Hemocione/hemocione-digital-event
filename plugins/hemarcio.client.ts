import {
  hemarcioContextFor,
  isHemarcioIframed,
  shouldShowHemarcioBubble,
} from "~/utils/hemarcioBubble";

const SDK_URL = "https://chat.hemocione.com.br/sdk/0.1.0/hemocione-sdk.js";

let sdkPromise: Promise<NonNullable<Window["HemocioneSDK"]>> | undefined;

const loadSdk = () => {
  sdkPromise ??= new Promise((resolve, reject) => {
    if (window.HemocioneSDK) return resolve(window.HemocioneSDK);
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () =>
      window.HemocioneSDK
        ? resolve(window.HemocioneSDK)
        : reject(new Error("HemocioneSDK ausente"));
    script.onerror = () => {
      sdkPromise = undefined;
      reject(new Error("falha ao carregar o SDK do Hemarcio"));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
};

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public;
  const router = useRouter();
  const inFrame = window.self !== window.top;
  const iframedFor = (route: { query: Record<string, unknown> }) =>
    isHemarcioIframed({ inFrame, query: route.query });
  let chat: ReturnType<
    NonNullable<Window["HemocioneSDK"]>["createHemocioneChat"]
  > | null = null;
  let creating = false;

  const sync = async () => {
    const route = router.currentRoute.value;
    const show = shouldShowHemarcioBubble({
      enabled: config.hemarcioEnabled as string,
      iframed: iframedFor(route),
      path: route.path,
    });
    if (!show) {
      chat?.destroy();
      chat = null;
      return;
    }
    const context = hemarcioContextFor(route.path, route.params);
    if (chat) return chat.setContext(context);
    if (creating) return;
    creating = true;
    try {
      const sdk = await loadSdk();
      const latest = router.currentRoute.value;
      if (
        !shouldShowHemarcioBubble({
          enabled: config.hemarcioEnabled as string,
          iframed: iframedFor(latest),
          path: latest.path,
        })
      )
        return;
      chat = sdk.createHemocioneChat({
        chatUrl: config.hemarcioChatUrl as string,
        context: hemarcioContextFor(latest.path, latest.params),
      });
    } catch (error) {
      console.warn("[hemarcio]", error);
    } finally {
      creating = false;
    }
  };

  nuxtApp.hook("app:mounted", sync);
  router.afterEach(() => {
    if (nuxtApp.isHydrating) return;
    void sync();
  });
});
