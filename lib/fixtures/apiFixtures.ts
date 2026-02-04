import {
  APIRequestContext,
  request as playwrightRequest,
  APIResponse,
} from "@playwright/test";
import { User } from "@utils/user";
import { Note } from "@utils/note";
import { API_BASE_URL, HTTP_HEADERS } from "@utils/constants";
import { sendRequest } from "@utils/helpers";

/**
 * API Fixtures type definition
 * Includes API request context and utility functions for user and note management
 */
export type ApiFixtures = {
  apiContext: APIRequestContext;
  deleteUserAccount: (user: User) => Promise<APIResponse>;
  deleteNoteById: (user: User, note: Note) => Promise<APIResponse>;
};

/**
 * API Fixtures implementation
 * Provides setup and teardown for API tests
 * Includes functions to delete user accounts and notes via API
 */
export const apiFixtures = {
  apiContext: async ({}, use: (r: APIRequestContext) => Promise<void>) => {
    const context = await playwrightRequest.newContext({
      baseURL: API_BASE_URL,
    });
    await use(context);
    await context.dispose();
  },

  /**
   * Deletes a user account via API
   *
   * @param {User} user - User object containing authentication token
   * @returns {APIResponse} API response from delete account request
   */
  deleteUserAccount: async (
    { apiContext }: { apiContext: APIRequestContext },
    use: (r: (user: User) => Promise<APIResponse>) => Promise<void>,
  ) => {
    const deleteUserFn = async (user: User): Promise<APIResponse> => {
      const response = await sendRequest(
        apiContext,
        "delete",
        "users/delete-account",
        {
          headers: {
            [HTTP_HEADERS.AUTH_TOKEN]: user.getToken(),
          },
        },
      );

      user.clearNotes();
      return response;
    };

    await use(deleteUserFn);
  },

  /**
   * Deletes a note by ID via API
   * @param {User} user - User object containing authentication token
   * @param {Note} note - Note object to be deleted
   * @returns {APIResponse} API response from delete note request
   */
  deleteNoteById: async (
    { apiContext }: { apiContext: APIRequestContext },
    use: (r: (user: User, note: Note) => Promise<APIResponse>) => Promise<void>,
  ) => {
    const deleteNoteFn = async (
      user: User,
      note: Note,
    ): Promise<APIResponse> => {
      const response = await sendRequest(
        apiContext,
        "delete",
        `notes/${note.getId()}`,
        {
          headers: {
            [HTTP_HEADERS.AUTH_TOKEN]: user.getToken(),
          },
          data: {
            id: note.getId(),
          },
        },
      );

      user.clearNotes();
      return response;
    };

    await use(deleteNoteFn);
  },
};
