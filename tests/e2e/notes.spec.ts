import { test, expect } from "@lib/baseE2eTest";
import { Note } from "@utils/note";
import { generateNoteApi } from "@utils/helpers";
import { API_MESSAGES, NOTE_CATEGORIES } from "@utils/constants";

const getLastNote = (authenticatedUser: { getNotes: () => Note[] }): Note => {
  const notes = authenticatedUser.getNotes();
  return notes[notes.length - 1];
};

const cloneNote = (note: Note): Note =>
  new Note(
    note.getId(),
    note.getTitle(),
    note.getDescription(),
    note.getCategory(),
    note.getCompleted(),
    note.getUserId(),
    note.getCreatedAt(true),
    note.getUpdatedAt(),
  );

test.describe("Notes", () => {
  test.beforeEach(async ({ authenticatedUser, setAuthToken }) => {
    await setAuthToken(authenticatedUser.getToken());
  });

  test.afterEach(async ({ authenticatedUser, deleteUserAccount }) => {
    if (authenticatedUser.getToken()) {
      await deleteUserAccount(authenticatedUser);
    }
  });

  test("Add New Note", async ({ notesPage, note }) => {
    await notesPage.gotoNotes();
    await notesPage.addNewNote(note);
    await notesPage.verifyNote(note);
  });

  test("Add Note Validation", async ({ notesPage }) => {
    await notesPage.gotoNotes();
    await notesPage.openAddNoteModal();
    await notesPage.submitNoteForm();
    await notesPage.verifyNoteValidationErrors([
      API_MESSAGES.TITLE_REQUIRED,
      API_MESSAGES.DESCRIPTION_REQUIRED,
    ]);
  });

  test("Edit Note", async ({ notesPage, apiCreatedNote }) => {
    const updatedNote = cloneNote(apiCreatedNote);
    await notesPage.gotoNotes();
    updatedNote.setCategory(NOTE_CATEGORIES.WORK);
    updatedNote.setTitle("Updated " + apiCreatedNote.getTitle());
    updatedNote.setDescription("Updated " + apiCreatedNote.getDescription());
    updatedNote.setCompleted(true);

    await notesPage.editNote(apiCreatedNote, updatedNote);
    await notesPage.verifyNote(updatedNote);
  });

  test("Delete Note", async ({ notesPage, apiCreatedNote }) => {
    await notesPage.gotoNotes();
    await notesPage.deleteNote(apiCreatedNote);
    await notesPage.verifyNoteDeleted(apiCreatedNote);
  });

  test("Verify Note Categories", async ({
    notesPage,
    apiContext,
    authenticatedUser,
  }) => {
    const categories = [
      NOTE_CATEGORIES.HOME,
      NOTE_CATEGORIES.WORK,
      NOTE_CATEGORIES.PERSONAL,
    ];
    for (const category of categories) {
      await generateNoteApi(apiContext, authenticatedUser, category);
    }

    await notesPage.gotoNotes();

    for (const note of authenticatedUser.getNotes()) {
      await notesPage.filterByCategory(note.getCategory());
      await notesPage.verifyNote(note);
    }
  });

  test("Search Notes", async ({ notesPage, apiContext, authenticatedUser }) => {
    const categories = [
      NOTE_CATEGORIES.HOME,
      NOTE_CATEGORIES.WORK,
      NOTE_CATEGORIES.PERSONAL,
    ];
    for (const category of categories) {
      await generateNoteApi(apiContext, authenticatedUser, category);
    }
    await notesPage.gotoNotes();

    for (const note of authenticatedUser.getNotes()) {
      await notesPage.searchNoteByTitle(note.getTitle());
      await notesPage.verifyNote(note);
    }
  });

  test("Note Details View", async ({ notesPage, apiCreatedNote }) => {
    await notesPage.gotoNotes();
    await notesPage.openNoteDetails(apiCreatedNote);
    await notesPage.verifyNoteDetails(apiCreatedNote);
  });

  // Note: This test simulates a large number of notes to test pagination behavior.
  // Actual pagination controls are not implemented in the UI.
  test("Pagination", async ({ notesPage, mockManyNotes }) => {
    await mockManyNotes(100);
    await notesPage.gotoNotes();
    await expect(notesPage.noteCard).toHaveCount(100);
  });
});
