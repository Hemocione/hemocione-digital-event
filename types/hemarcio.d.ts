export {};

declare global {
  interface Window {
    HemocioneSDK?: {
      createHemocioneChat: (options: {
        chatUrl: string;
        context?: Record<string, unknown>;
      }) => {
        setContext: (context: Record<string, unknown>) => void;
        destroy: () => void;
      };
    };
  }
}
