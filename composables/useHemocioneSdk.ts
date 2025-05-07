import { createHemocioneSdk } from "@hemocione/sdk";

let hemocioneSdk: ReturnType<typeof createHemocioneSdk> | null = null;

export const useHemocioneSdk = () => {
  if (!import.meta.client) return null;

  if (!hemocioneSdk) {
    hemocioneSdk = createHemocioneSdk();
  }

  return hemocioneSdk;
};
