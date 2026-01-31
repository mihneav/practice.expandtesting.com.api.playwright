import { test } from "@lib/baseE2eTest";
import { expect } from "@playwright/test";
import { StatusCodes } from "http-status-codes";
import { expectSuccessResponse } from "@utils/assertions";
import { sendRequest } from "@utils/helpers";
import {
  API_ENDPOINTS,
  API_MESSAGES,
  HTTP_HEADERS,
  TEST_CONFIG,
} from "@utils/constants";

test.describe.serial("User API", () => {
  test.afterAll(async ({ authenticatedUser, deleteUser }) => {
    if (authenticatedUser?.getToken?.()) {
      try {
        await deleteUser(authenticatedUser);
      } catch (error) {
        console.log(`User cleanup skipped: ${error}`);
      }
    }
  });

  test("POST /users/register", async ({ request, user }) => {
    const response = await sendRequest(
      request,
      "post",
      API_ENDPOINTS.USERS_REGISTER,
      {
        data: {
          name: user.getFullName(),
          email: user.getEmail(),
          password: user.getPassword(),
        },
      },
    );

    const body = await response.json();
    await expectSuccessResponse(
      response,
      {
        id: expect.any(String),
        name: user.getFullName(),
        email: user.getEmail(),
      },
      StatusCodes.CREATED,
      API_MESSAGES.USER_CREATED,
    );
    expect(body.data.id).toHaveLength(TEST_CONFIG.ID_LENGTH);

    user.setId(body.data.id);
  });

  test("POST /users/login", async ({ request, registeredUser }) => {
    const response = await sendRequest(
      request,
      "post",
      API_ENDPOINTS.USERS_LOGIN,
      {
        data: {
          email: registeredUser.getEmail(),
          password: registeredUser.getPassword(),
        },
      },
    );

    const body = await response.json();

    await expectSuccessResponse(
      response,
      {
        id: expect.any(String),
        email: registeredUser.getEmail(),
        name: registeredUser.getFullName(),
        token: expect.any(String),
      },
      StatusCodes.OK,
      API_MESSAGES.LOGIN_SUCCESSFUL,
    );
    expect(body.data.id).toHaveLength(TEST_CONFIG.ID_LENGTH);
    expect(body.data.token).toHaveLength(TEST_CONFIG.TOKEN_LENGTH);

    registeredUser.setToken(body.data.token);
    registeredUser.setId(body.data.id);
  });

  test("GET /users/profile", async ({ request, authenticatedUser }) => {
    const response = await sendRequest(
      request,
      "get",
      API_ENDPOINTS.USERS_PROFILE,
      {
        headers: {
          [HTTP_HEADERS.AUTH_TOKEN]: authenticatedUser.getToken(),
        },
      },
    );

    const body = await response.json();

    await expectSuccessResponse(
      response,
      {
        id: authenticatedUser.getId(),
        name: authenticatedUser.getFullName(),
        email: authenticatedUser.getEmail(),
      },
      StatusCodes.OK,
      API_MESSAGES.PROFILE_SUCCESSFUL,
    );
    expect(body.data.id).toHaveLength(TEST_CONFIG.ID_LENGTH);
  });

  test("PATCH /users/profile", async ({ request, authenticatedUser }) => {
    const updatedData = {
      name: authenticatedUser.getFirstName() + "_updated",
      phone: authenticatedUser.getPhone() + "9",
      company:
        authenticatedUser
          .getCompany()
          .substring(0, TEST_CONFIG.COMPANY_NAME_MAX_LENGTH) + " Ltd",
    };

    const response = await sendRequest(
      request,
      "patch",
      API_ENDPOINTS.USERS_PROFILE,
      {
        headers: {
          [HTTP_HEADERS.AUTH_TOKEN]: authenticatedUser.getToken(),
        },
        data: updatedData,
      },
    );

    const body = await response.json();

    await expectSuccessResponse(
      response,
      {
        company: updatedData.company,
        email: authenticatedUser.getEmail(),
        id: authenticatedUser.getId(),
        name: updatedData.name,
        phone: updatedData.phone,
      },
      StatusCodes.OK,
      API_MESSAGES.PROFILE_UPDATED,
    );
    expect(body.data.id).toHaveLength(TEST_CONFIG.ID_LENGTH);
  });

  test("POST /users/forgot-password", async ({
    request,
    authenticatedUser,
  }) => {
    const response = await sendRequest(
      request,
      "post",
      API_ENDPOINTS.USERS_FORGOT_PASSWORD,
      {
        data: {
          email: authenticatedUser.getEmail(),
        },
      },
    );

    await expectSuccessResponse(
      response,
      undefined,
      StatusCodes.OK,
      API_MESSAGES.PASSWORD_RESET_SENT(authenticatedUser.getEmail()),
    );
  });

  test("POST /users/change-password", async ({
    request,
    authenticatedUser,
  }) => {
    const response = await sendRequest(
      request,
      "post",
      API_ENDPOINTS.USERS_CHANGE_PASSWORD,
      {
        headers: {
          [HTTP_HEADERS.AUTH_TOKEN]: authenticatedUser.getToken(),
        },
        data: {
          currentPassword: authenticatedUser.getPassword(),
          newPassword: "newPassword123",
        },
      },
    );

    await expectSuccessResponse(
      response,
      undefined,
      StatusCodes.OK,
      API_MESSAGES.PASSWORD_UPDATED,
    );
  });

  test("DELETE /users/logout", async ({ request, authenticatedUser }) => {
    const response = await sendRequest(
      request,
      "delete",
      API_ENDPOINTS.USERS_LOGOUT,
      {
        headers: {
          [HTTP_HEADERS.AUTH_TOKEN]: authenticatedUser.getToken(),
        },
      },
    );

    await expectSuccessResponse(
      response,
      undefined,
      StatusCodes.OK,
      API_MESSAGES.LOGOUT_SUCCESSFUL,
    );
  });

  test("DELETE /users/delete", async ({ request, authenticatedUser }) => {
    const response = await sendRequest(
      request,
      "delete",
      API_ENDPOINTS.USERS_DELETE_ACCOUNT,
      {
        headers: {
          [HTTP_HEADERS.AUTH_TOKEN]: authenticatedUser.getToken(),
        },
      },
    );

    await expectSuccessResponse(
      response,
      undefined,
      StatusCodes.OK,
      API_MESSAGES.ACCOUNT_DELETED,
    );
  });
});
