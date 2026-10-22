export interface HemarcioChat {
  setContext(context: any): void;
  destroy(): void;
}

export interface HemarcioSdk {
  createHemocioneChat(options: any): HemarcioChat;
}

// Falha fechada: se ler window.top lancar (cross-origin), assume iframe.
export function isInsideIframe(win: { self: unknown; top: unknown } = window): boolean {
  try {
    return win.self !== win.top;
  } catch {
    return true;
  }
}

export function readIframedQuery(search: string): boolean {
  return new URLSearchParams(search).get("iframed") === "true";
}

// Chamar UMA vez no inicio do plugin: a query some apos a primeira navegacao.
export function resolveIframed(
  win: { self: unknown; top: unknown; location: { search: string } } = window,
): boolean {
  return readIframedQuery(win.location.search) || isInsideIframe(win);
}

// Uma unica tag <script> por carregamento; falha tambem fica memoizada (sem retry).
export function createSdkLoader(
  url: string,
  doc: any = document,
  win: { HemocioneSDK?: HemarcioSdk } = window,
): () => Promise<HemarcioSdk> {
  let promise: Promise<HemarcioSdk> | undefined;
  return () =>
    (promise ??= new Promise<HemarcioSdk>((resolve, reject) => {
      if (win.HemocioneSDK) return resolve(win.HemocioneSDK);
      const script = doc.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = () =>
        win.HemocioneSDK
          ? resolve(win.HemocioneSDK)
          : reject(new Error("HemocioneSDK ausente"));
      script.onerror = () =>
        reject(new Error("falha ao carregar o SDK do Hemarcio"));
      doc.head.appendChild(script);
    }));
}

export interface HemarcioControllerDeps<R> {
  getRoute: () => R;
  isVisible: (route: R) => boolean;
  buildContext: (route: R) => Record<string, unknown>;
  loadSdk: () => Promise<HemarcioSdk>;
  chatUrl: string;
  chatOptions?: Record<string, unknown>;
  warn?: (...args: unknown[]) => void;
}

export function createHemarcioController<R>(deps: HemarcioControllerDeps<R>) {
  const warn = deps.warn ?? console.warn;
  let chat: HemarcioChat | null = null;
  let creating = false;
  let failed = false;

  async function sync(): Promise<void> {
    const route = deps.getRoute();
    if (!deps.isVisible(route)) {
      chat?.destroy();
      chat = null;
      return;
    }
    if (chat) {
      chat.setContext(deps.buildContext(route));
      return;
    }
    if (creating || failed) return;
    creating = true;
    try {
      const sdk = await deps.loadSdk();
      // a rota pode ter mudado durante o carregamento do script
      const latest = deps.getRoute();
      if (chat || !deps.isVisible(latest)) return;
      if (typeof sdk?.createHemocioneChat !== "function") {
        throw new Error("HemocioneSDK sem createHemocioneChat");
      }
      chat = sdk.createHemocioneChat({
        chatUrl: deps.chatUrl,
        context: deps.buildContext(latest),
        ...deps.chatOptions,
      });
    } catch (error) {
      failed = true;
      warn("[hemarcio]", error);
    } finally {
      creating = false;
    }
  }

  return { sync };
}
