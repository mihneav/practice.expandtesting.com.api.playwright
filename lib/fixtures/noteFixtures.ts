import { APIRequestContext } from "@playwright/test";
import { User } from "@utils/user";
import { Note } from "@utils/note";
import { HTTP_HEADERS } from "@utils/constants";
import { sendRequest } from "@utils/helpers";

export type NoteFixtures = {
  note: Note;
  generateNote: Note;
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

  generateNote: async (
    {
      apiContext,
      authenticatedUser,
    }: { apiContext: APIRequestContext; authenticatedUser: User },
    use: (r: Note) => Promise<void>,
  ) => {
    const note = await Note.createNote(authenticatedUser.getId(), "Home");

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
};
