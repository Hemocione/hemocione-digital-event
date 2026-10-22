import { describe, expect, it } from "vitest";
import {
  hemarcioContextFor,
  shouldShowHemarcioBubble,
} from "~/utils/hemarcioBubble";

const base = { enabled: "true", iframed: false, path: "/event/doe-rj" };

describe("shouldShowHemarcioBubble", () => {
  it("mostra em pagina do doador com flag ligada", () => {
    expect(shouldShowHemarcioBubble(base)).toBe(true);
    expect(shouldShowHemarcioBubble({ ...base, enabled: true })).toBe(true);
    expect(shouldShowHemarcioBubble({ ...base, path: "/" })).toBe(true);
  });
  it("esconde com flag desligada ou ausente", () => {
    expect(shouldShowHemarcioBubble({ ...base, enabled: "false" })).toBe(false);
    expect(shouldShowHemarcioBubble({ ...base, enabled: "" })).toBe(false);
    expect(shouldShowHemarcioBubble({ ...base, enabled: undefined })).toBe(
      false,
    );
  });
  it("esconde dentro de iframe", () => {
    expect(shouldShowHemarcioBubble({ ...base, iframed: true })).toBe(false);
  });
  it("mantem a bolha em captation e rotas parecidas com share", () => {
    for (const p of [
      "/event/doe-rj/captation/school",
      "/captation/company",
      "/event/doe-rj/sharepoint",
    ]) {
      expect(shouldShowHemarcioBubble({ ...base, path: p })).toBe(true);
    }
  });
  it("esconde nas paginas de equipe e de imagem OG", () => {
    for (const p of [
      "/event/doe-rj/backoffice",
      "/event/doe-rj/volunteer/x",
      "/event/doe-rj/volunteer",
      "/event/doe-rj/bloodbag",
      "/chart/bloodbag",
      "/event/doe-rj/share/instagram",
      "/event/doe-rj/share",
    ]) {
      expect(shouldShowHemarcioBubble({ ...base, path: p })).toBe(false);
    }
  });
});

describe("hemarcioContextFor", () => {
  it("inclui eventSlug valido", () => {
    expect(
      hemarcioContextFor("/event/doe-rj/schedules", { eventSlug: "doe-rj" }),
    ).toEqual({
      product: "eventos",
      page: "/event/doe-rj/schedules",
      eventSlug: "doe-rj",
    });
  });
  it("omite eventSlug ausente ou invalido", () => {
    expect(hemarcioContextFor("/", {})).toEqual({
      product: "eventos",
      page: "/",
    });
    expect(hemarcioContextFor("/event/X", { eventSlug: "<script>" })).toEqual({
      product: "eventos",
      page: "/event/X",
    });
    expect(hemarcioContextFor("/event/X", { eventSlug: ["a"] })).toEqual({
      product: "eventos",
      page: "/event/X",
    });
  });
});
