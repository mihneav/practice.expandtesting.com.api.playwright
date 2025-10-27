import { test, expect } from "@playwright/test";
import { StatusCodes } from "http-status-codes";
import { User } from "../utils/user";
import { setupUser } from "../utils/setup";
import { deleteUser } from "../utils/teardown";

test.describe("Tests endpoints for response 40X", () => {
  let user: User;

  const endpoints = [
    // Health Check
    ["/health-check", "GET"],
    // User Management
    ["/users/register", "POST"],
    ["/users/login", "POST"],
    ["/users/profile", "PATCH"],
    ["/users/forgot-password", "POST"],
    ["/users/verify-reset-password-token", "POST"],
    ["/users/reset-password", "POST"],
    ["/users/change-password", "POST"],
    ["/users/logout", "DELETE"],
    ["/users/delete-account", "DELETE"],
    // Note Management
    ["/notes/", "POST"],
    ["/notes/invalid-note-id", "GET"],
    ["/notes/invalid-note-id", "PATCH"],
    ["/notes/invalid-note-id", "DELETE"],
  ];

  test.beforeAll(async () => {
    user = await setupUser(await User.createUser());
  });

  test.afterAll(async () => {
    if (user.token) {
      await deleteUser(user);
    }
  });

  async function makeRequest(
    request: any,
    endpoint: string,
    method: string,
    options: any
  ) {
    switch (method) {
      case "GET":
        return await request.get(endpoint, options);
      case "POST":
        return await request.post(endpoint, options);
      case "PATCH":
        return await request.patch(endpoint, options);
      case "DELETE":
        return await request.delete(endpoint, options);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  endpoints.forEach(([endpoint, httpMethod]) => {
    test.fail(
      `${httpMethod} ${endpoint} should return ${StatusCodes.UNAUTHORIZED}`,
      async ({ request }) => {
        const response = await makeRequest(request, endpoint, httpMethod, {
          headers: { "x-auth-token": "" },
        });

        expect(response.status()).toBe(StatusCodes.UNAUTHORIZED);
      }
    );
  });

  endpoints.forEach(([endpoint, httpMethod]) => {
    test(`${httpMethod} ${endpoint} should return ${StatusCodes.NOT_FOUND}`, async ({
      request,
    }) => {
      const response = await makeRequest(request, endpoint, httpMethod, {
        headers: { "x-auth-token": user.token },
      });

      expect(response.status()).toBe(StatusCodes.NOT_FOUND);
    });
  });
});
