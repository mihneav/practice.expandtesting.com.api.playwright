import { test } from "@lib/baseE2eTest";
import { API_MESSAGES } from "@utils/constants";

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

test.describe("Login", () => {
  test.afterEach(async ({ authenticatedUser, deleteUserAccount }) => {
    if (authenticatedUser?.getToken?.()) {
      await deleteUserAccount(authenticatedUser);
    }
  });

  test("Login", async ({ loginPage, notesPage, authenticatedUser }) => {
    await loginPage.gotoLogin();
    await loginPage.login(
      authenticatedUser.getEmail(),
      authenticatedUser.getPassword(),
    );
    await notesPage.expectLogoutVisible();
    await loginPage.expectHomeVisible();
  });

  test("Login with invalid credentials", async ({
    loginPage,
    authenticatedUser,
  }) => {
    await loginPage.gotoLogin();
    await loginPage.login("invalid@example.com", "wrongpassword");
    await loginPage.expectLoginError();
  });

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
