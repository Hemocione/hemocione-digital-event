const config = useRuntimeConfig();

type GamificationFact = {
  userId: string;
  eventType: string;
  occurredAt: string;
  payload: Record<string, unknown>;
  idempotencyKey: string;
};

// Deliberately catches internally — called via runAsync/waitUntil with no caller
// awaiting the result, so a rejected promise here would only surface as an
// unhandled rejection instead of failing anything meaningful.
export async function postFactToHemocioneId(fact: GamificationFact) {
  try {
    const response = await fetch(`${config.hemocioneIdApiUrl}/internal/facts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret": config.hemocioneIdFactsSecret,
      },
      body: JSON.stringify({ ...fact, sourceService: "hemocione-digital-event" }),
    });
    if (!response.ok) {
      console.error(
        `[gamification] hemocione-id rejected fact push: ${response.status}`,
      );
    }
  } catch (error) {
    console.error("[gamification] failed to push fact to hemocione-id", error);
  }
}
