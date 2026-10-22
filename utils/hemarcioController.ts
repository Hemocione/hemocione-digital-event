export interface HemarcioChat {
  setContext(context: any): void;
  destroy(): void;
  ask?(intent: string, context: any): unknown;
}

export interface HemarcioSdk {
  createHemocioneChat(options: any): HemarcioChat;
  hemarcioAsk?(
    intent: string,
    context: Record<string, unknown>,
    options?: { chat?: HemarcioChat | null },
  ): Promise<void>;
  canAskHemarcio?(options?: { chat?: HemarcioChat | null }): Promise<boolean>;
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

// Lista ordenada de URLs: tenta a proxima no onerror. Uma unica tentativa por
// carregamento; falha total tambem fica memoizada (sem retry).
export function createSdkLoader(
  urls: string | string[],
  doc: any = document,
  win: { HemocioneSDK?: HemarcioSdk } = window,
): () => Promise<HemarcioSdk> {
  const list = Array.isArray(urls) ? urls : [urls];
  let promise: Promise<HemarcioSdk> | undefined;
  return () =>
    (promise ??= new Promise<HemarcioSdk>((resolve, reject) => {
      if (win.HemocioneSDK) return resolve(win.HemocioneSDK);
      const tryUrl = (index: number) => {
        if (index >= list.length) {
          return reject(new Error("falha ao carregar o SDK do Hemarcio"));
        }
        const script = doc.createElement("script");
        script.src = list[index];
        script.async = true;
        script.onload = () =>
          win.HemocioneSDK
            ? resolve(win.HemocioneSDK)
            : reject(new Error("HemocioneSDK ausente"));
        script.onerror = () => {
          script.remove?.();
          tryUrl(index + 1);
        };
        doc.head.appendChild(script);
      };
      tryUrl(0);
    }));
}

export interface HemarcioControllerDeps<R> {
  getRoute: () => R;
  isVisible: (route: R) => boolean;
  // flag ligada: o botao contextual pode aparecer mesmo com a bolha oculta (dentro do App)
  isEnabled?: () => boolean;
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

  let sdkRef: HemarcioSdk | null = null;
  let available = false;
  let checkedChat: HemarcioChat | null | undefined;
  let checkSeq = 0;
  const listeners = new Set<(value: boolean) => void>();

  function setAvailable(value: boolean) {
    if (value === available) return;
    available = value;
    listeners.forEach((listener) => listener(value));
  }

  async function refreshAvailability(): Promise<void> {
    if (!(deps.isEnabled?.() ?? false)) {
      checkSeq++; // invalida checagem em voo
      return setAvailable(false);
    }
    // resultado positivo vale enquanto o chat for o mesmo (evita novo handshake a cada rota)
    if (available && checkedChat === chat) return;
    const seq = ++checkSeq;
    let result = false;
    try {
      sdkRef ??= await deps.loadSdk();
      if (typeof sdkRef.canAskHemarcio === "function") {
        result = !!(await sdkRef.canAskHemarcio({ chat }));
      }
    } catch {
      result = false;
    }
    if (seq !== checkSeq) return;
    checkedChat = chat;
    setAvailable(result);
  }

  async function ask(
    intent: string,
    context: Record<string, unknown>,
  ): Promise<void> {
    try {
      const sdk = sdkRef ?? (await deps.loadSdk());
      if (typeof sdk.hemarcioAsk !== "function") {
        throw new Error("HemocioneSDK sem hemarcioAsk");
      }
      await sdk.hemarcioAsk(intent, context, { chat });
    } catch (error) {
      warn("[hemarcio]", error);
    }
  }

  async function syncBubble(): Promise<void> {
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
      sdkRef = sdk;
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

  async function sync(): Promise<void> {
    await syncBubble();
    await refreshAvailability();
  }

  return {
    sync,
    ask,
    isAvailable: () => available,
    subscribe(listener: (value: boolean) => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
