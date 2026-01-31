import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

//Load environment variables from .env file
dotenv.config();

export default defineConfig({
  testDir: "./tests/",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined, // Use default workers locally

  reporter: [["html"], ["list"]],

  // Increased timeout for API tests with potential network latency
  timeout: 30 * 1000,

  expect: {
    timeout: 10000,
  },

  use: {
    baseURL: process.env.BASE_URL || "https://practice.expandtesting.com/",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    extraHTTPHeaders: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  },

  projects: [
    {
      name: "API Tests",
      testMatch: ["**/api/*.spec.ts"],
      use: {
        screenshot: "off",
        video: "off",
      },
    },
    {
      name: "E2E Tests",
      testMatch: ["**/e2e/*.spec.ts"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
});
