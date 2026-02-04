import { Page } from "@playwright/test";

/**
 * Auth Fixtures type definition
 * Includes functions to set and clear authentication tokens in local storage
 */
export type AuthFixtures = {
  setAuthToken: (token: string) => Promise<void>; // ✅ Keep
  clearAuthToken: () => Promise<void>; // ✅ Rename from unsetAuthToken
};

/**
 * Auth Fixtures implementation
 * Provides functions to set and clear authentication tokens in local storage
 * Used for simulating authenticated and unauthenticated states in tests
 */
export const authFixtures = {
  setAuthToken: async (
    { page }: { page: Page },
    use: (r: (token: string) => Promise<void>) => Promise<void>,
  ) => {
    const setToken = async (token: string): Promise<void> => {
      await page.context().addInitScript((token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("activeCategory", "All");
      }, token);
    };
    await use(setToken);
  },

  clearAuthToken: async (
    { page }: { page: Page },
    use: (r: () => Promise<void>) => Promise<void>,
  ) => {
    const clearAuthToken = async (): Promise<void> => {
      await page.context().addInitScript(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("activeCategory");
      });
    };
    await use(clearAuthToken);
  },
};
