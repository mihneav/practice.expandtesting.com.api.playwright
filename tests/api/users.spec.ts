import { test, expect } from "@lib/baseE2eTest";
import { StatusCodes } from "http-status-codes";
import { expectSuccessResponse } from "@utils/assertions";
import { sendRequest } from "@utils/helpers";
import {
  API_ENDPOINTS,
  API_MESSAGES,
  HTTP_HEADERS,
  TEST_CONFIG,
} from "@utils/constants";

/**
 * User API test suite (serial execution)
 * Tests user-related endpoints including registration, login, profile management, password changes, and account deletion
 * Tests are executed serially to maintain consistent state across tests
 */
test.describe.serial("User API", () => {
  /**
   * Cleanup hook that runs after all tests in the suite
   * Deletes the user account if authentication was successful
   * @param {Object} params - Test parameters
   * @param {User} params.authenticatedUser - The authenticated user object
   * @param {Function} params.deleteUserAccount - Function to delete user account
   */
  test.afterAll(async ({ authenticatedUser, deleteUserAccount }) => {
    if (authenticatedUser?.getToken?.()) {
      try {
        await deleteUserAccount(authenticatedUser);
      } catch (error) {
        console.log(`User cleanup skipped: ${error}`);
      }
    }
  });

  /**
   * Test user registration via POST endpoint
   * Verifies that a new user can be successfully registered with valid credentials
   * @param {Object} params - Test parameters
   * @param {request} params.request - Playwright request object for making HTTP calls
   * @param {User} params.user - Test user object with registration details
   */
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

  /**
   * Test user login via POST endpoint
   * Verifies that a registered user can successfully login and receive an authentication token
   * @param {Object} params - Test parameters
   * @param {request} params.request - Playwright request object for making HTTP calls
   * @param {User} params.registeredUser - A pre-registered user object
   */
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

  /**
   * Test retrieving user profile via GET endpoint
   * Verifies that authenticated user can retrieve their profile information
   * @param {Object} params - Test parameters
   * @param {request} params.request - Playwright request object for making HTTP calls
   * @param {User} params.authenticatedUser - The authenticated user object
   */
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

  /**
   * Test updating user profile via PATCH endpoint
   * Verifies that user profile information can be successfully updated
   * @param {Object} params - Test parameters
   * @param {request} params.request - Playwright request object for making HTTP calls
   * @param {User} params.authenticatedUser - The authenticated user object
   */
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

  /**
   * Test forgot password functionality via POST endpoint
   * Verifies that a password reset email can be requested for a registered user
   * @param {Object} params - Test parameters
   * @param {request} params.request - Playwright request object for making HTTP calls
   * @param {User} params.authenticatedUser - The authenticated user object
   */
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

  /**
   * Test changing password via POST endpoint
   * Verifies that an authenticated user can successfully change their password
   * @param {Object} params - Test parameters
   * @param {request} params.request - Playwright request object for making HTTP calls
   * @param {User} params.authenticatedUser - The authenticated user object
   */
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

  /**
   * Test user logout via DELETE endpoint
   * Verifies that an authenticated user can successfully logout
   * @param {Object} params - Test parameters
   * @param {request} params.request - Playwright request object for making HTTP calls
   * @param {User} params.authenticatedUser - The authenticated user object
   */
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

  /**
   * Test account deletion via DELETE endpoint
   * Verifies that an authenticated user can successfully delete their account
   * @param {Object} params - Test parameters
   * @param {request} params.request - Playwright request object for making HTTP calls
   * @param {User} params.authenticatedUser - The authenticated user object
   */
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
