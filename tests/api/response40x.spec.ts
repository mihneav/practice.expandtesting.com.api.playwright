import { test, expect } from "@playwright/test";
import { StatusCodes } from "http-status-codes";
import { API_ENDPOINTS } from "@utils/constants";
import { getMethod, sendRequest } from "@utils/helpers";

test.describe("Tests endpoints for response 40X", () => {
  const endpoints = [
    [API_ENDPOINTS.HEALTH_CHECK, "GET", false],
    [API_ENDPOINTS.USERS_REGISTER, "POST", false],
    [API_ENDPOINTS.USERS_LOGIN, "POST", false],
    [API_ENDPOINTS.USERS_PROFILE, "GET", true],
    [API_ENDPOINTS.USERS_PROFILE, "PATCH", true],
    [API_ENDPOINTS.USERS_FORGOT_PASSWORD, "POST", false],
    [API_ENDPOINTS.USERS_RESET_PASSWORD, "POST", false],
    [API_ENDPOINTS.USERS_CHANGE_PASSWORD, "POST", true],
    [API_ENDPOINTS.USERS_LOGOUT, "DELETE", true],
    [API_ENDPOINTS.USERS_DELETE_ACCOUNT, "DELETE", true],
    [API_ENDPOINTS.NOTES, "GET", true],
    [API_ENDPOINTS.NOTES, "POST", true],
    [API_ENDPOINTS.NOTE_BY_ID("invalid"), "GET", true],
    [API_ENDPOINTS.NOTE_BY_ID("invalid"), "PUT", true],
    [API_ENDPOINTS.NOTE_BY_ID("invalid"), "PATCH", true],
    [API_ENDPOINTS.NOTE_BY_ID("invalid"), "DELETE", true],
  ] as const;

  for (const [endpoint, httpMethod, requiresAuth] of endpoints) {
    const method = getMethod(httpMethod);

    if (requiresAuth) {
      test(`${httpMethod} ${endpoint} should return UNAUTHORIZED without token`, async ({
        request,
      }) => {
        const response = await sendRequest(request, method, endpoint, {
          headers: { "x-auth-token": "" },
        });
        expect(response.status()).toBe(StatusCodes.UNAUTHORIZED);
      });
    }

    test(`${httpMethod} ${endpoint} should return NOT FOUND for invalid endpoints`, async ({
      request,
    }) => {
      const invalidEndpoint = endpoint.replace("api", "invalid-api");
      const response = await sendRequest(request, method, invalidEndpoint);
      expect(response.status()).toBe(StatusCodes.NOT_FOUND);
    });
  }
});
