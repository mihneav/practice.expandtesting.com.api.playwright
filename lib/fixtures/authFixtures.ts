import { Page } from "@playwright/test";

export type AuthFixtures = {
  setAuthToken: (token: string) => Promise<void>;
};

export const authFixtures = {
  setAuthToken: async (
    { page }: { page: Page },
    use: (r: (token: string) => Promise<void>) => Promise<void>,
  ) => {
    const setToken = async (token: string): Promise<void> => {
      await page.addInitScript((token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("activeCategory", "All");
      }, token);
    };
    await use(setToken);
  },
};
