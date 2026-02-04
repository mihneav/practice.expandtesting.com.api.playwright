import { test } from "@lib/baseE2eTest";
import { StatusCodes } from "http-status-codes";
import { expectSuccessResponse } from "@utils/assertions";
import { API_ENDPOINTS } from "@utils/constants";
import { sendRequest } from "@utils/helpers";

/**
 * Test deleting a note via DELETE endpoint
 * Verifies that a note can be successfully deleted
 * @param {Object} params - Test parameters
 * @param {request} params.request - Playwright request object for making HTTP calls
 */
test.describe("Health Check API", () => {
  test("Health Status", async ({ request }) => {
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
