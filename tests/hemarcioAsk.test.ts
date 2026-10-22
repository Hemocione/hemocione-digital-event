import { describe, expect, it, vi } from "vitest";
import {
  createHemarcioController,
  createSdkLoader,
} from "~/utils/hemarcioController";

type FakeScript = { src?: string; onload?: () => void; onerror?: () => void };

const makeSdk = (canAsk: boolean) => {
  const chat = { setContext: vi.fn(), destroy: vi.fn() };
  return {
    chat,
    createHemocioneChat: vi.fn(() => chat),
    hemarcioAsk: vi.fn(async () => {}),
    canAskHemarcio: vi.fn(async () => canAsk),
  };
};

const setup = (
  opts: { enabled?: boolean; visible?: boolean; canAsk?: boolean } = {},
) => {
  const sdk = makeSdk(opts.canAsk ?? true);
  const controller = createHemarcioController({
    getRoute: () => ({ path: "/a" }),
    isVisible: () => opts.visible ?? true,
    isEnabled: () => opts.enabled ?? true,
    buildContext: () => ({ page: "/a" }),
    loadSdk: async () => sdk,
    chatUrl: "https://chat.test",
    warn: vi.fn(),
  });
  return { sdk, controller };
};

describe("disponibilidade do botao contextual", () => {
  it("comeca indisponivel (botao oculto)", () => {
    expect(setup().controller.isAvailable()).toBe(false);
  });

  it("fica indisponivel com a flag desligada, sem carregar o SDK", async () => {
    const { sdk, controller } = setup({ enabled: false });
    await controller.sync();
    expect(controller.isAvailable()).toBe(false);
    expect(sdk.canAskHemarcio).not.toHaveBeenCalled();
  });

  it("fica disponivel com bolha criada e canAskHemarcio true", async () => {
    const { sdk, controller } = setup();
    const seen: boolean[] = [];
    controller.subscribe((v) => seen.push(v));
    await controller.sync();
    expect(sdk.canAskHemarcio).toHaveBeenCalledWith({ chat: sdk.chat });
    expect(controller.isAvailable()).toBe(true);
    expect(seen).toEqual([true]);
  });

  it("dentro do App (bolha oculta) consulta sem chat e segue a resposta", async () => {
    const yes = setup({ visible: false, canAsk: true });
    await yes.controller.sync();
    expect(yes.sdk.createHemocioneChat).not.toHaveBeenCalled();
    expect(yes.sdk.canAskHemarcio).toHaveBeenCalledWith({ chat: null });
    expect(yes.controller.isAvailable()).toBe(true);

    const no = setup({ visible: false, canAsk: false });
    await no.controller.sync();
    expect(no.controller.isAvailable()).toBe(false);
  });

  it("fica indisponivel se o SDK nao tem canAskHemarcio", async () => {
    const sdk = { createHemocioneChat: vi.fn() };
    const controller = createHemarcioController({
      getRoute: () => ({}),
      isVisible: () => false,
      isEnabled: () => true,
      buildContext: () => ({}),
      loadSdk: async () => sdk,
      chatUrl: "x",
      warn: vi.fn(),
    });
    await controller.sync();
    expect(controller.isAvailable()).toBe(false);
  });
});

describe("ask", () => {
  it("chama hemarcioAsk com a intencao e o contexto exatos", async () => {
    const { sdk, controller } = setup();
    await controller.sync();
    const ctx = { product: "x", screen: "y" };
    await controller.ask("a.b", ctx);
    expect(sdk.hemarcioAsk).toHaveBeenCalledWith("a.b", ctx, {
      chat: sdk.chat,
    });
  });

  it("nao propaga erro do SDK", async () => {
    const { sdk, controller } = setup();
    sdk.hemarcioAsk.mockRejectedValueOnce(new Error("boom"));
    await expect(controller.ask("a.b", {})).resolves.toBeUndefined();
  });
});

describe("createSdkLoader com lista de URLs", () => {
  it("tenta a proxima URL no onerror", async () => {
    const scripts: FakeScript[] = [];
    const doc = {
      createElement: () => ({ remove: vi.fn() }),
      head: { appendChild: (s: FakeScript) => scripts.push(s) },
    };
    const win: { HemocioneSDK?: unknown } = {};
    const load = createSdkLoader(["https://a.js", "https://b.js"], doc, win);
    const p = load();
    expect(scripts.map((s) => s.src)).toEqual(["https://a.js"]);
    scripts[0].onerror?.();
    expect(scripts.map((s) => s.src)).toEqual(["https://a.js", "https://b.js"]);
    win.HemocioneSDK = { createHemocioneChat: vi.fn() };
    scripts[1].onload?.();
    await expect(p).resolves.toBe(win.HemocioneSDK);
  });

  it("rejeita quando todas as URLs falham", async () => {
    const scripts: FakeScript[] = [];
    const doc = {
      createElement: () => ({ remove: vi.fn() }),
      head: { appendChild: (s: FakeScript) => scripts.push(s) },
    };
    const p = createSdkLoader(["https://a.js", "https://b.js"], doc, {})();
    scripts[0].onerror?.();
    scripts[1].onerror?.();
    await expect(p).rejects.toThrow();
  });
});
