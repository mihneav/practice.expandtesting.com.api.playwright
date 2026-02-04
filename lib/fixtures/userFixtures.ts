import { APIRequestContext, expect } from "@playwright/test";
import { User } from "@utils/user";
import { StatusCodes } from "http-status-codes";
import { sendRequest } from "@utils/helpers";

/**
 * User Fixtures type definition
 * Includes a generic user, an authenticated user, and a registered user
 */
export type UserFixtures = {
  user: User;
  authenticatedUser: User;
  registeredUser: User;
};

/**
 * Registers a user via API
 * @param {APIRequestContext} apiContext - Playwright API request context
 * @param {User} user - User object to register
 */
const registerUser = async (
  apiContext: APIRequestContext,
  user: User,
): Promise<void> => {
  const registerResponse = await sendRequest(
    apiContext,
    "post",
    "users/register/",
    {
      data: {
        name: user.getFullName(),
        email: user.getEmail(),
        password: user.getPassword(),
      },
    },
  );

  if (
    registerResponse.status() !== StatusCodes.CREATED &&
    registerResponse.status() !== StatusCodes.CONFLICT
  ) {
    const body = await registerResponse.text();
    throw new Error(
      `Registration failed: ${registerResponse.status()} - ${body}`,
    );
  }

  const registerBody = await registerResponse.json();
  if (registerBody?.data?.id) {
    user.setId(registerBody.data.id);
  }
};

/**
 * Logs in a user via API and sets the authentication token
 * @param {APIRequestContext} apiContext - Playwright API request context
 * @param {User} user - User object to log in
 */
export const loginUser = async (
  apiContext: APIRequestContext,
  user: User,
): Promise<void> => {
  const loginResponse = await sendRequest(apiContext, "post", "users/login/", {
    data: {
      email: user.getEmail(),
      password: user.getPassword(),
    },
  });

  expect(loginResponse.status()).toBe(StatusCodes.OK);
  const loginBody = await loginResponse.json();
  expect(loginBody.success).toBe(true);
  expect(loginBody.data.token).toBeTruthy();
  expect(loginBody.data.id).toBeTruthy();

  user.setId(loginBody.data.id);
  user.setToken(loginBody.data.token);
};

/**
 * User Fixtures implementation
 * Provides a generic user, an authenticated user, and a registered user
 */
export const userFixtures = {
  user: async ({}, use: (r: User) => Promise<void>) => {
    const user = await User.createUser();
    await use(user);
  },

  /**
   * Provides an authenticated user fixture
   */
  authenticatedUser: async (
    { apiContext }: { apiContext: APIRequestContext },
    use: (r: User) => Promise<void>,
  ) => {
    const user = await User.createUser();

    await registerUser(apiContext, user);
    await loginUser(apiContext, user);

    await use(user);
  },

  /**
   * Provides a registered user fixture
   */
  registeredUser: async (
    { apiContext }: { apiContext: APIRequestContext },
    use: (r: User) => Promise<void>,
  ) => {
    const user = await User.createUser();

    await registerUser(apiContext, user);

    await use(user);
  },
};
