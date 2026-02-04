import { APIRequestContext, Page } from "@playwright/test";
import { User } from "@utils/user";
import { Note } from "@utils/note";
import { HTTP_HEADERS, API_MESSAGES } from "@utils/constants";
import { sendRequest } from "@utils/helpers";

/**
 * Note Fixtures type definition
 * Includes a single note, a function to create notes via API, and a function to mock multiple notes
 */
export type NoteFixtures = {
  note: Note;
  apiCreatedNote: (category?: string) => Promise<Note>;
  mockManyNotes: (count: number) => Promise<void>;
};

export const noteFixtures = {
  /**
   * Provides a single note instance
   * @param {User} authenticatedUser - Object containing authenticatedUser
   * @param {Function}use - Function to use the note instance
   */
  note: async (
    { authenticatedUser }: { authenticatedUser: User },
    use: (r: Note) => Promise<void>,
  ) => {
    const note = await Note.createNote(authenticatedUser.getId());
    await use(note);
  },

  /**
   * Creates a note via API and adds it to the authenticated user's notes
   * @param {APIRequestContext} apiContext - Playwright API request context
   * @param {User} authenticatedUser - Object containing authenticatedUser
   * @param {Function} use - Function to use the created note
   */
  apiCreatedNote: async (
    {
      apiContext,
      authenticatedUser,
    }: {
      apiContext: APIRequestContext;
      authenticatedUser: User;
    },
    use: (r: (category?: string) => Promise<Note>) => Promise<void>,
  ) => {
    const createdNotes: Note[] = [];

    const createNote = async (category: string = "Home"): Promise<Note> => {
      const note = await Note.createNote(authenticatedUser.getId(), category);

      const response = await sendRequest(apiContext, "post", "notes/", {
        headers: {
          [HTTP_HEADERS.AUTH_TOKEN]: authenticatedUser.getToken(),
        },
        data: {
          title: note.getTitle(),
          description: note.getDescription(),
          category: note.getCategory(),
        },
      });

      const body = await response.json();
      const createdNote = Note.fromResponse(body.data);

      authenticatedUser.addNote(createdNote);
      createdNotes.push(createdNote);

      return createdNote;
    };

    await use(createNote);

    // Cleanup: Delete all notes after test completes
    for (const note of createdNotes) {
      try {
        await sendRequest(apiContext, "delete", `notes/${note.getId()}`, {
          headers: {
            [HTTP_HEADERS.AUTH_TOKEN]: authenticatedUser.getToken(),
          },
        });
        authenticatedUser.removeNote(note);
      } catch (error) {
        console.log(`Note cleanup skipped: ${error}`);
      }
    }
  },

  /**
   * Mocks multiple notes in the API response
   * @param {Page} page - Playwright page object
   * @param {User} authenticatedUser - Object containing authenticatedUser
   * @param {Function} use - Function to use the mock notes function
   */
  mockManyNotes: async (
    { page, authenticatedUser }: { page: Page; authenticatedUser: User },
    use: (r: (count: number) => Promise<void>) => Promise<void>,
  ) => {
    const mockNotes = async (count: number): Promise<void> => {
      await page.route("**/api/notes", async (route) => {
        const notes: Note[] = [];
        const notePromises = Array.from({ length: count }, () =>
          Note.createNote(authenticatedUser.getId()),
        );
        const createdNotes = await Promise.all(notePromises);
        notes.push(...createdNotes);
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            status: 200,
            message: API_MESSAGES.NOTE_RETRIEVED,
            data: notes,
          }),
        });
      });
    };
    await use(mockNotes);
  },
};
