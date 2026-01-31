import { Page } from "@playwright/test";
import { LoginPage } from "@pages/loginPage";
import { RegisterPage } from "@pages/registerPage";
import { NotesPage } from "@pages/notesPage";

export type PageFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  notesPage: NotesPage;
};

export const pageFixtures = {
  loginPage: async (
    { page }: { page: Page },
    use: (r: LoginPage) => Promise<void>,
  ) => {
    await use(new LoginPage(page));
  },

  registerPage: async (
    { page }: { page: Page },
    use: (r: RegisterPage) => Promise<void>,
  ) => {
    await use(new RegisterPage(page));
  },

  notesPage: async (
    { page }: { page: Page },
    use: (r: NotesPage) => Promise<void>,
  ) => {
    await use(new NotesPage(page));
  },
};
