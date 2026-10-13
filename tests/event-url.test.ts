import { beforeEach, describe, expect, it } from "vitest";

const g = globalThis as typeof globalThis & { useRuntimeConfig: () => unknown };
g.useRuntimeConfig = () => ({
  public: { siteUrl: "https://eventos.example.com" },
});

const { getEventUrl, withEventUrl, withEventUrls } = await import(
  "../server/utils/eventUrl"
);

beforeEach(() => {
  g.useRuntimeConfig = () => ({
    public: { siteUrl: "https://eventos.example.com" },
  });
});

describe("eventUrl", () => {
  it("monta a url pública do evento", () => {
    expect(getEventUrl("meu-evento-ab12")).toBe(
      "https://eventos.example.com/event/meu-evento-ab12",
    );
  });

  it("withEventUrl adiciona url sem remover campos nem mutar o original", () => {
    const original = { slug: "a-b", name: "A" };
    const result = withEventUrl(original);
    expect(result).toEqual({
      slug: "a-b",
      name: "A",
      url: "https://eventos.example.com/event/a-b",
    });
    expect(original).not.toHaveProperty("url");
  });

  it("withEventUrls aplica a cada item", () => {
    const result = withEventUrls([{ slug: "a" }, { slug: "b" }]);
    expect(result.map((e) => e.url)).toEqual([
      "https://eventos.example.com/event/a",
      "https://eventos.example.com/event/b",
    ]);
  });
});
