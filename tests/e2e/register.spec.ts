import { test } from "@lib/baseE2eTest";

/**
 * Register test suite
 * Tests user registration functionality including successful registration and error handling
 */
test.describe("Register", () => {
  /**
   * Cleanup hook that runs after each test
   * Deletes the user account if authentication was successful
   * @param {Object} params - Test parameters
   * @param {User} params.authenticatedUser - The authenticated user object
   * @param {Function} params.deleteUserAccount - Function to delete user account
   */
  test.afterEach(async ({ authenticatedUser, deleteUserAccount }) => {
    if (authenticatedUser?.getToken?.()) {
      await deleteUserAccount(authenticatedUser);
    }
  });

  /**
   * Test successful user registration
   * Verifies that a new user can register successfully with valid credentials
   * @param {Object} params - Test parameters
   * @param {RegisterPage} params.registerPage - Register page object
   * @param {User} params.user - Test user object with registration details
   */
  test("Register", async ({ registerPage, user }) => {
    await registerPage.gotoRegister();
    await registerPage.registerUser(user);
    await registerPage.expectRegistrationSuccess();
  });

  /**
   * Test registration with existing email
   * Verifies that registration fails when attempting to use an email that already exists
   * @param {Object} params - Test parameters
   * @param {RegisterPage} params.registerPage - Register page object
   * @param {User} params.authenticatedUser - An already authenticated user with existing email
   */
  test("Register with existing email", async ({
    registerPage,
    authenticatedUser,
  }) => {
    await registerPage.gotoRegister();
    await registerPage.registerUser(authenticatedUser);
    await registerPage.expectRegistrationError();
  });
});
