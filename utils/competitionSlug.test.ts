import { describe, expect, it } from "vitest";
import { extractCompetitionSlug } from "./competitionSlug";

describe("extractCompetitionSlug", () => {
  it("extrai o slug de uma url de copa", () => {
    expect(
      extractCompetitionSlug(
        "https://copa.hemocione.com.br/competition/trote-solidario-20262",
      ),
    ).toBe("trote-solidario-20262");
  });

  it("ignora barra final", () => {
    expect(
      extractCompetitionSlug(
        "https://copa.hemocione.com.br/competition/trote-solidario-20262/",
      ),
    ).toBe("trote-solidario-20262");
  });

  it("ignora sufixo de rota depois do slug", () => {
    expect(
      extractCompetitionSlug(
        "https://copa.hemocione.com.br/competition/abc/register",
      ),
    ).toBe("abc");
  });

  it("ignora query e hash", () => {
    expect(
      extractCompetitionSlug(
        "https://copa.hemocione.com.br/competition/abc?x=1#y",
      ),
    ).toBe("abc");
  });

  it("devolve undefined quando a url nao e de competicao", () => {
    expect(
      extractCompetitionSlug("https://exemplo.com/qualquer/coisa"),
    ).toBeUndefined();
  });

  it("devolve undefined quando 'competition' e o ultimo segmento", () => {
    expect(
      extractCompetitionSlug("https://copa.hemocione.com.br/competition"),
    ).toBeUndefined();
  });

  it("devolve undefined para ausente, vazio e invalido", () => {
    expect(extractCompetitionSlug(null)).toBeUndefined();
    expect(extractCompetitionSlug(undefined)).toBeUndefined();
    expect(extractCompetitionSlug("")).toBeUndefined();
    expect(extractCompetitionSlug("nao e url")).toBeUndefined();
  });
});
