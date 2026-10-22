import type { Ref } from "vue";

export interface HemarcioAsk {
  available: Ref<boolean>;
  ask: (intent: string, context: Record<string, unknown>) => Promise<void>;
}

// Sem o plugin (SSR, flag desligada): indisponivel e sem efeito.
export function useHemarcioAsk(): HemarcioAsk {
  const shared = (useNuxtApp() as unknown as { $hemarcioAsk?: HemarcioAsk })
    .$hemarcioAsk;
  return shared ?? { available: ref(false), ask: async () => {} };
}
