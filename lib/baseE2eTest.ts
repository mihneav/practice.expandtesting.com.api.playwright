import {
  test as baseTest,
  expect,
  request,
  BrowserContext,
  APIRequestContext,
  APIResponse,
} from "@playwright/test";
import { pageFixtures, PageFixtures } from "@fixtures/pageFixtures";
import { apiFixtures, ApiFixtures } from "@fixtures/apiFixtures";
import { userFixtures, UserFixtures } from "@fixtures/userFixtures";
import { noteFixtures, NoteFixtures } from "@fixtures/noteFixtures";
import { authFixtures, AuthFixtures } from "@fixtures/authFixtures";
import { setupPageEnhancements } from "@fixtures/pageEnhancements";

// Combine all fixture types
type BaseFixtures = PageFixtures &
  ApiFixtures &
  UserFixtures &
  NoteFixtures &
  AuthFixtures;

export const test = baseTest.extend<BaseFixtures>({
  ...apiFixtures,
  ...userFixtures,
  ...noteFixtures,
  ...authFixtures,
  ...pageFixtures,

  // Override page fixture to add enhancements (must come after pageFixtures)
  page: async ({ page }, use) => {
    await setupPageEnhancements(page);
    await use(page);
  },
});

export { BrowserContext };
export { APIRequestContext };
export { APIResponse };
export { expect };
export { request };
