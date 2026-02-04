import { APIRequestContext, Page } from "@playwright/test";
import { User } from "@utils/user";
import { Note } from "@utils/note";
import { HTTP_HEADERS, API_MESSAGES } from "@utils/constants";
import { sendRequest } from "@utils/helpers";

export type NoteFixtures = {
  note: Note;
  apiCreatedNote: Note;
  mockManyNotes: (count: number) => Promise<void>;
};

export const noteFixtures = {
  note: async (
    { authenticatedUser }: { authenticatedUser: User },
    use: (r: Note) => Promise<void>,
  ) => {
    const note = await Note.createNote(authenticatedUser.getId());
    await use(note);
    // Note cleanup handled by deleteUser in afterEach
  },

  apiCreatedNote: async (
    {
      apiContext,
      authenticatedUser,
    }: {
      apiContext: APIRequestContext;
      authenticatedUser: User;
    },
    use: (r: Note) => Promise<void>,
  ) => {
    const note = await Note.createNote("Home");

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
    await use(createdNote);

    // Cleanup: Delete the note after test completes
    try {
      await sendRequest(apiContext, "delete", `notes/${createdNote.getId()}`, {
        headers: {
          [HTTP_HEADERS.AUTH_TOKEN]: authenticatedUser.getToken(),
        },
      });
      authenticatedUser.removeNote(createdNote);
    } catch (error) {
      // Note may have been deleted during test, ignore error
      console.log(`Note cleanup skipped: ${error}`);
    }
  },

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
