import { Page, Locator, expect } from "@playwright/test";
import { API_MESSAGES } from "@utils/constants";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly home: Locator;
  readonly logout: Locator;
  readonly errorAlert: Locator;
  readonly validationErrors: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId("login-email");
    this.passwordInput = page.getByTestId("login-password");
    this.submitButton = page.getByTestId("login-submit");
    this.home = page.getByTestId("home");
    this.logout = page.getByTestId("logout");
    this.errorAlert = page.getByTestId("alert-message");
    this.validationErrors = page.locator(".invalid-feedback");
  }

  async gotoLogin(): Promise<void> {
    await this.page.goto("/notes/app/login");
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.waitFor({ state: "visible" });
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectHomeVisible(): Promise<void> {
    await expect(this.home).toBeVisible();
  }

  async expectLogoutVisible(): Promise<void> {
    await expect(this.logout).toBeVisible();
  }

  async expectLoginError(): Promise<void> {
    await expect(this.errorAlert).toHaveText(API_MESSAGES.LOGIN_ERROR);
  }

  async expectValidationError(index: number, errorMsg: string): Promise<void> {
    const error = this.validationErrors.nth(index);
    await expect(error).toBeVisible();
    await expect(error).toHaveText(errorMsg);
  }
}
