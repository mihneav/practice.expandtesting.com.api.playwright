import { test } from "@playwright/test";
import { StatusCodes } from "http-status-codes";
import { expectSuccessResponse } from "@utils/assertions";
import { API_ENDPOINTS } from "@utils/constants";
import { sendRequest } from "@utils/helpers";

test.describe("Health Check API", () => {
  test("should return successful health status", async ({ request }) => {
    const response = await sendRequest(
      request,
      "get",
      API_ENDPOINTS.HEALTH_CHECK,
    );

    await expectSuccessResponse(
      response,
      undefined,
      StatusCodes.OK,
      "Notes API is Running",
    );
  });
});
