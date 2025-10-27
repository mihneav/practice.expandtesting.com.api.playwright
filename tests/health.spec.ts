import { test, expect } from "@playwright/test";
import { StatusCodes } from "http-status-codes";

test.describe("Health Check API", () => {
  test("should return successful health status", async ({ request }) => {
    const response = await request.get("health-check/");

    const body = await response.json();

    expect(response.status()).toBe(StatusCodes.OK);
    expect(body).toEqual({
      success: true,
      status: StatusCodes.OK,
      message: "Notes API is Running",
    });
  });
});
