import { expect, test } from "@lib/baseE2eTest";
import { UI_MESSAGES } from "@utils/constants";

/**
 * Profile test suite
 * Tests profile-related functionality including profile fields, logout, profile updates, and password changes
 */
test.describe("Profile", () => {
  /**
   * Setup hook that runs before each test
   * Authenticates user by setting the auth token
   * @param {Object} params - Test parameters
   * @param {User} params.authenticatedUser - The authenticated user object
   * @param {Function} params.setAuthToken - Function to set the authentication token
   */
  test.beforeEach(async ({ authenticatedUser, setAuthToken }) => {
    await setAuthToken(authenticatedUser.getToken());
  });

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
   * Test that verifies profile page displays correct user information
   * Validates that user ID, full name, and email are correctly displayed
   * @param {Object} params - Test parameters
   * @param {ProfilePage} params.profilePage - Profile page object
   * @param {User} params.authenticatedUser - The authenticated user object
   */
  test("Check Profile fields", async ({ profilePage, authenticatedUser }) => {
    await profilePage.gotoProfile();
    await expect(profilePage.userIdInput).toHaveValue(
      authenticatedUser.getId(),
    );
    await expect(profilePage.fullNameInput).toHaveValue(
      authenticatedUser.getFullName(),
    );
    await expect(profilePage.emailInput).toHaveValue(
      authenticatedUser.getEmail(),
    );
  });

  /**
   * Test logout functionality
   * Verifies that user is successfully logged out and logout button is no longer visible
   * @param {Object} params - Test parameters
   * @param {ProfilePage} params.profilePage - Profile page object
   * @param {Function} params.clearAuthToken - Function to clear the authentication token
   */
  test("Logout", async ({ profilePage, clearAuthToken }) => {
    await profilePage.gotoProfile();
    await profilePage.logout(clearAuthToken);
    await expect(profilePage.logoutButton).not.toBeVisible();
  });

  /**
   * Test profile update form validation
   * Verifies that validation errors are displayed for invalid profile update submissions
   * @param {Object} params - Test parameters
   * @param {ProfilePage} params.profilePage - Profile page object
   * @param {User} params.authenticatedUser - The authenticated user object
   */
  test("Profile Update Validation", async ({
    profilePage,
    authenticatedUser,
  }) => {
    await profilePage.gotoProfile();
    await profilePage.fullNameInput.clear();
    await profilePage.phoneInput.fill("1");
    await profilePage.page.getByTestId("update-profile").click();

    const validationErrors = [
      UI_MESSAGES.PROFILE_USER_NAME_REQUIRED,
      UI_MESSAGES.PROFILE_PHONE_NUMBER_LENGTH,
    ];

    for (const [index, error] of validationErrors.entries()) {
      await profilePage.expectValidationError(index, error);
    }
  });

  /**
   * Test successful profile update
   * Verifies that user profile information can be successfully updated
   * @param {Object} params - Test parameters
   * @param {ProfilePage} params.profilePage - Profile page object
   * @param {User} params.authenticatedUser - The authenticated user object
   */
  test("Profile Update", async ({ profilePage, authenticatedUser }) => {
    await profilePage.gotoProfile();

    const newFullName = "Updated " + authenticatedUser.getFullName();
    const newPhone = "1234567890";

    await profilePage.fullNameInput.fill(newFullName);
    await profilePage.phoneInput.fill(newPhone);
    await profilePage.page.getByTestId("update-profile").click();

    // Verify updated values
    await expect(profilePage.fullNameInput).toHaveValue(newFullName);
    await expect(profilePage.phoneInput).toHaveValue(newPhone);
  });

  /**
   * Test change password form validation
   * Verifies that validation errors are displayed when attempting to change password with missing required fields
   * @param {Object} params - Test parameters
   * @param {ProfilePage} params.profilePage - Profile page object
   */
  test("Change Password Validation", async ({ profilePage }) => {
    await profilePage.gotoProfile();
    await profilePage.changePasswordTab.click();

    await profilePage.updatePasswordButton.click();
    const validationErrors = [
      UI_MESSAGES.PROFILE_CURRENT_PASSWORD_REQUIRED,
      UI_MESSAGES.PROFILE_NEW_PASSWORD_REQUIRED,
      UI_MESSAGES.PROFILE_CONFIRM_PASSWORD_REQUIRED,
    ];

    for (const [index, error] of validationErrors.entries()) {
      await profilePage.expectValidationError(index, error);
    }
  });

  /**
   * Test successful password change
   * Verifies that user can successfully change their password and login with the new password
   * @param {Object} params - Test parameters
   * @param {ProfilePage} params.profilePage - Profile page object
   * @param {User} params.authenticatedUser - The authenticated user object
   * @param {LoginPage} params.loginPage - Login page object
   * @param {Function} params.clearAuthToken - Function to clear the authentication token
   */
  test("Change Password", async ({
    profilePage,
    authenticatedUser,
    loginPage,
    clearAuthToken,
  }) => {
    const currentPassword = authenticatedUser.getPassword();
    const newPassword = "NewPassword123";

    await profilePage.gotoProfile();
    await profilePage.changePasswordTab.click();

    await profilePage.currentPasswordInput.fill(
      authenticatedUser.getPassword(),
    );
    authenticatedUser.setPassword(newPassword);
    await profilePage.newPasswordInput.fill(authenticatedUser.getPassword());
    await profilePage.confirmPasswordInput.fill(
      authenticatedUser.getPassword(),
    );
    await profilePage.updatePasswordButton.click();

    // Logout after password change
    await profilePage.logout(clearAuthToken);

    // Try logging in with the new password
    await loginPage.gotoLogin();
    await loginPage.login(
      authenticatedUser.getEmail(),
      authenticatedUser.getPassword(),
    );
  });
});
