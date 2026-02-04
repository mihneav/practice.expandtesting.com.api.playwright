import { Page, Locator, expect } from "@playwright/test";
import { API_MESSAGES } from "@utils/constants";

export class ProfilePage {
  readonly page: Page;
  readonly userIdInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly fullNameInput: Locator;
  readonly companyNameInput: Locator;
  readonly errorAlert: Locator;
  readonly validationErrors: Locator;
  readonly logoutButton: Locator;
  readonly changePasswordTab: Locator;
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly updatePasswordButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userIdInput = page.getByTestId("user-id");
    this.logoutButton = page.getByTestId("logout");
    this.phoneInput = page.getByTestId("user-phone");
    this.emailInput = page.getByTestId("user-email");
    this.fullNameInput = page.getByTestId("user-name");
    this.companyNameInput = page.getByTestId("user-company");
    this.errorAlert = page.getByTestId("error-alert");
    this.validationErrors = page.locator(".invalid-feedback");
    this.changePasswordTab = page.getByTestId("change-password");
    this.currentPasswordInput = page.getByTestId("current-password");
    this.newPasswordInput = page.getByTestId("new-password");
    this.confirmPasswordInput = page.getByTestId("confirm-password");
    this.updatePasswordButton = page.getByTestId("update-password");
  }

  async gotoProfile(): Promise<void> {
    await this.page.goto("/notes/app/profile");
  }

  async expectValidationError(index: number, message: string): Promise<void> {
    await expect(this.validationErrors.nth(index)).toHaveText(message);
  }

  async getLogoutButton(): Promise<Locator> {
    return this.logoutButton;
  }

  async logout(unsetAuthToken: () => Promise<void>): Promise<void> {
    await Promise.all([
      this.page.waitForResponse((response) =>
        response.url().includes("/logout"),
      ),
      this.logoutButton.click(),
    ]);
    await unsetAuthToken();
  }
}
