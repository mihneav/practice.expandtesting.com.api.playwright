import { test } from "@lib/baseE2eTest";
import { LoginPage } from "@pages/loginPage";
import { NotesPage } from "@pages/notesPage";
import { API_MESSAGES } from "@utils/constants";
import { User } from "@utils/user";

/**
 * Invalid login test data
 * Contains various invalid email and password combinations with expected validation errors
 */
const invalidLoginData = [
  {
    email: "",
    password: "",
    errors: [API_MESSAGES.EMAIL_REQUIRED, API_MESSAGES.PASSWORD_REQUIRED],
  },
  {
    email: "invalidemail",
    password: "i",
    errors: [API_MESSAGES.EMAIL_INVALID, API_MESSAGES.PASSWORD_LENGTH],
  },
  {
    email: "invalidemail@",
    password: "passwordthatexceedsthirtycharacters",
    errors: [API_MESSAGES.EMAIL_INVALID, API_MESSAGES.PASSWORD_LENGTH],
  },
];

/**
 * Login test suite
 * Tests user login functionality including successful login, invalid credentials, and validation error handling
 */
test.describe("Login", () => {
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
   * Test successful user login
   * Verifies that a user can successfully login with valid credentials and access the notes page
   * @param {Object} params - Test parameters
   * @param {LoginPage} params.loginPage - Login page object
   * @param {NotesPage} params.notesPage - Notes page object
   * @param {User} params.authenticatedUser - The authenticated user object
   */
  test("Login", async ({ loginPage, notesPage, authenticatedUser }) => {
    await loginPage.gotoLogin();
    await loginPage.login(
      authenticatedUser.getEmail(),
      authenticatedUser.getPassword(),
    );
    await notesPage.expectLogoutVisible();
    await loginPage.expectHomeVisible();
  });

  /**
   * Test login with invalid credentials
   * Verifies that login fails and an error is displayed when invalid credentials are provided
   * @param {Object} params - Test parameters
   * @param {LoginPage} params.loginPage - Login page object
   * @param {User} params.authenticatedUser - The authenticated user object
   */
  test("Login with invalid credentials", async ({
    loginPage,
    authenticatedUser,
  }) => {
    await loginPage.gotoLogin();
    await loginPage.login("invalid@example.com", "wrongpassword");
    await loginPage.expectLoginError();
  });

  /**
   * Test login form validation errors
   * Verifies that appropriate validation errors are displayed for various invalid email and password combinations
   * @param {Object} params - Test parameters
   * @param {LoginPage} params.loginPage - Login page object
   */
  test(`Verify invalid login validation errors`, async ({ loginPage }) => {
    await loginPage.gotoLogin();
    for (const data of invalidLoginData) {
      await loginPage.login(data.email, data.password);
      for (const [index, errorMsg] of data.errors.entries()) {
        await loginPage.expectValidationError(index, errorMsg);
      }
    }
  });
});
