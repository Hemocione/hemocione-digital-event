import { describe, expect, it, vi } from "vitest";
import {
  createHemarcioController,
  createSdkLoader,
  isInsideIframe,
  readIframedQuery,
  resolveIframed,
} from "~/utils/hemarcioController";

const makeChat = () => ({ setContext: vi.fn(), destroy: vi.fn() });

const setup = (visible: (path: string) => boolean = () => true) => {
  const route = { path: "/a" };
  const chat = makeChat();
  const sdk = { createHemocioneChat: vi.fn(() => chat) };
  const warn = vi.fn();
  const controller = createHemarcioController({
    getRoute: () => route,
    isVisible: (r) => visible(r.path),
    buildContext: (r) => ({ page: r.path }),
    loadSdk: async () => sdk,
    chatUrl: "https://chat.test",
    warn,
  });
  return { route, chat, sdk, warn, controller };
};

describe("createHemarcioController", () => {
  it("cria o chat uma vez e so atualiza contexto nas navegacoes seguintes", async () => {
    const { route, chat, sdk, controller } = setup();
    await controller.sync();
    route.path = "/b";
    await controller.sync();
    route.path = "/c";
    await controller.sync();
    expect(sdk.createHemocioneChat).toHaveBeenCalledTimes(1);
    expect(chat.setContext).toHaveBeenCalledTimes(2);
  });

  it("destroi ao entrar em rota excluida e recria ao voltar", async () => {
    const { route, chat, sdk, controller } = setup((p) => p !== "/staff");
    await controller.sync();
    route.path = "/staff";
    await controller.sync();
    expect(chat.destroy).toHaveBeenCalledTimes(1);
    route.path = "/a";
    await controller.sync();
    expect(sdk.createHemocioneChat).toHaveBeenCalledTimes(2);
  });

  it("nao cria se a rota virou excluida durante o carregamento", async () => {
    const { route, sdk, controller } = setup((p) => p !== "/staff");
    const pending = controller.sync();
    route.path = "/staff";
    await pending;
    expect(sdk.createHemocioneChat).not.toHaveBeenCalled();
  });

  it("avisa uma vez e nao tenta de novo apos falha", async () => {
    const warn = vi.fn();
    const loadSdk = vi.fn(async () => {
      throw new Error("boom");
    });
    const controller = createHemarcioController({
      getRoute: () => ({}),
      isVisible: () => true,
      buildContext: () => ({}),
      loadSdk,
      chatUrl: "x",
      warn,
    });
    await controller.sync();
    await controller.sync();
    await controller.sync();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(loadSdk).toHaveBeenCalledTimes(1);
  });

  it("falha sem quebrar se o SDK nao expoe createHemocioneChat", async () => {
    const warn = vi.fn();
    const controller = createHemarcioController({
      getRoute: () => ({}),
      isVisible: () => true,
      buildContext: () => ({}),
      loadSdk: async () => ({}) as never,
      chatUrl: "x",
      warn,
    });
    await controller.sync();
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe("createSdkLoader", () => {
  const fakeDoc = () => {
    const scripts: Record<string, any>[] = [];
    return {
      scripts,
      createElement: () => ({}),
      head: { appendChild: (s: Record<string, any>) => scripts.push(s) },
    };
  };

  it("injeta uma unica tag script", async () => {
    const doc = fakeDoc();
    const win: { HemocioneSDK?: any } = {};
    const load = createSdkLoader("https://sdk.js", doc, win);
    const a = load();
    const b = load();
    win.HemocioneSDK = { createHemocioneChat: vi.fn() };
    doc.scripts[0].onload();
    await expect(a).resolves.toBe(win.HemocioneSDK);
    await expect(b).resolves.toBe(win.HemocioneSDK);
    expect(doc.scripts).toHaveLength(1);
  });

  it("memoiza a falha sem injetar nova tag", async () => {
    const doc = fakeDoc();
    const load = createSdkLoader("https://sdk.js", doc, {});
    const a = load();
    doc.scripts[0].onerror();
    await expect(a).rejects.toThrow();
    await expect(load()).rejects.toThrow();
    expect(doc.scripts).toHaveLength(1);
  });

  it("rejeita se o script carrega mas o global nao existe", async () => {
    const doc = fakeDoc();
    const load = createSdkLoader("https://sdk.js", doc, {});
    const a = load();
    doc.scripts[0].onload();
    await expect(a).rejects.toThrow("ausente");
  });

  it("reaproveita o global ja presente", async () => {
    const doc = fakeDoc();
    const sdk = { createHemocioneChat: vi.fn() };
    await expect(
      createSdkLoader("https://sdk.js", doc, { HemocioneSDK: sdk })(),
    ).resolves.toBe(sdk);
    expect(doc.scripts).toHaveLength(0);
  });
});

describe("deteccao de iframe", () => {
  it("falha fechada quando ler window.top lanca", () => {
    const win = {
      self: {},
      get top(): unknown {
        throw new Error("cross-origin");
      },
    };
    expect(isInsideIframe(win)).toBe(true);
  });
  it("compara self e top", () => {
    const w = {};
    expect(isInsideIframe({ self: w, top: w })).toBe(false);
    expect(isInsideIframe({ self: w, top: {} })).toBe(true);
  });
  it("le ?iframed=true", () => {
    expect(readIframedQuery("?iframed=true")).toBe(true);
    expect(readIframedQuery("?iframed=false")).toBe(false);
    expect(readIframedQuery("")).toBe(false);
  });
  it("resolveIframed junta query e iframe", () => {
    const w = {};
    expect(
      resolveIframed({ self: w, top: w, location: { search: "?iframed=true" } }),
    ).toBe(true);
    expect(
      resolveIframed({ self: w, top: w, location: { search: "" } }),
    ).toBe(false);
  });
});
