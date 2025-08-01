type PreScreening = {
    answeredAt: string;
    status: "able-to-donate" | "unable-to-donate";
    formResponseId: string;
  };
  
  export function useLastPreScreening(
    userId: string | undefined,
    eventSlug: string | undefined
  ): PreScreening | null {
    if (!userId || !eventSlug) return null;
  
    const key = `lastPreScreening_${userId}_${eventSlug}`;
    const item = localStorage.getItem(key);
    if (!item) return null;
  
    try {
      const parsed = JSON.parse(item) as PreScreening;
  
      if (!parsed?.answeredAt) return null;
  
      const answeredAt = new Date(parsed.answeredAt);
      if (isNaN(answeredAt.getTime())) return null;
  
      const now = new Date();
      const diffMonths =
        (now.getFullYear() - answeredAt.getFullYear()) * 12 +
        (now.getMonth() - answeredAt.getMonth());
  
      if (diffMonths <= 1) return parsed;
    } catch (e) {
      console.warn(`Erro ao parsear preScreening do localStorage (${key})`, e);
    }
  
    return null;
  }
  