import { expect, test } from "@lib/baseE2eTest";
import { loginUser } from "@lib/fixtures/userFixtures";
import { Note } from "@utils/note";

test.describe("Profile", () => {
  test.beforeEach(async ({ authenticatedUser, setAuthToken }) => {
    await setAuthToken(authenticatedUser.getToken());
  });

  test.afterEach(async ({ authenticatedUser, deleteUserAccount }) => {
    if (authenticatedUser?.getToken?.()) {
      await deleteUserAccount(authenticatedUser);
    }
  });

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

  test("Logout", async ({ profilePage, clearAuthToken }) => {
    await profilePage.gotoProfile();
    await profilePage.logout(clearAuthToken);
    await expect(profilePage.logoutButton).not.toBeVisible();
  });

  test("Profile Update Validation", async ({
    profilePage,
    authenticatedUser,
  }) => {
    await profilePage.gotoProfile();
    await profilePage.fullNameInput.clear();
    await profilePage.phoneInput.fill("1");
    await profilePage.page.getByTestId("update-profile").click();

    const validationErrors = [
      "User name is required",
      "Phone number should be between 8 and 20 digits",
    ];

    for (const [index, error] of validationErrors.entries()) {
      await profilePage.expectValidationError(index, error);
    }
  });

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

  test("Change Password Validation", async ({ profilePage }) => {
    await profilePage.gotoProfile();
    await profilePage.changePasswordTab.click();

    await profilePage.updatePasswordButton.click();
    const validationErrors = [
      "Current password is required",
      "New password is required",
      "Confirm password is required",
    ];

    for (const [index, error] of validationErrors.entries()) {
      await profilePage.expectValidationError(index, error);
    }
  });

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
