import { Page, Locator, expect } from "@playwright/test";
import { User } from "@utils/user";
import { API_MESSAGES } from "@utils/constants";

export class RegisterPage {
  readonly page: Page;
  readonly registerEmailInput: Locator;
  readonly registerNameInput: Locator;
  readonly registerPasswordInput: Locator;
  readonly registerConfirmPasswordInput: Locator;
  readonly registerSubmitButton: Locator;
  readonly successAlert: Locator;
  readonly alertMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.registerEmailInput = page.getByTestId("register-email");
    this.registerNameInput = page.getByTestId("register-name");
    this.registerPasswordInput = page.getByTestId("register-password");
    this.registerConfirmPasswordInput = page.getByTestId(
      "register-confirm-password",
    );
    this.registerSubmitButton = page.getByTestId("register-submit");
    this.successAlert = page.locator(".alert-success b");
    this.alertMessage = page.getByTestId("alert-message");
  }

  async gotoRegister(): Promise<void> {
    await this.page.goto("/notes/app/register");
  }

  async fillRegistrationForm(user: User): Promise<void> {
    await this.registerEmailInput.fill(user.getEmail());
    await this.registerNameInput.fill(user.getFullName());
    await this.registerPasswordInput.fill(user.getPassword());
    await this.registerConfirmPasswordInput.fill(user.getPassword());
  }

  async registerUser(user: User): Promise<void> {
    await this.fillRegistrationForm(user);
    await this.registerSubmitButton.click();
  }

  async expectRegistrationSuccess(): Promise<void> {
    await expect(this.successAlert).toHaveText(API_MESSAGES.USER_CREATED);
  }

  async expectRegistrationError(): Promise<void> {
    await expect(this.alertMessage).toHaveText(API_MESSAGES.USER_EXISTS);
  }
}
