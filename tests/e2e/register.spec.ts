import { test } from "@lib/baseE2eTest";

test.describe("Register", () => {
  test.afterEach(async ({ authenticatedUser, deleteUser }) => {
    if (authenticatedUser?.getToken?.()) {
      await deleteUser(authenticatedUser);
    }
  });

  test("Register", async ({ registerPage, user }) => {
    await registerPage.gotoRegister();
    await registerPage.registerUser(user);
    await registerPage.expectRegistrationSuccess();
  });

  test("Register with existing email", async ({
    registerPage,
    authenticatedUser,
  }) => {
    await registerPage.gotoRegister();
    await registerPage.registerUser(authenticatedUser);
    await registerPage.expectRegistrationError();
  });
});
