import { test } from "@lib/baseE2eTest";
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
    note.getCreatedAt(),
    note.getUpdatedAt(),
  );

test.describe("Notes", () => {
  test.beforeEach(async ({ authenticatedUser, setAuthToken }) => {
    await setAuthToken(authenticatedUser.getToken());
  });

  test.afterEach(async ({ authenticatedUser, deleteUser }) => {
    if (authenticatedUser.getToken()) {
      await deleteUser(authenticatedUser);
    }
  });

  test("Add New Note", async ({ notesPage, authenticatedUser }) => {
    await notesPage.gotoNotes();
    const note = await Note.createNote(authenticatedUser.getId());
    await notesPage.addNewNote(note);
    await notesPage.verifyNoteAdded(note);
    await notesPage.deleteNote(note);
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

  test("Edit Note", async ({ notesPage, authenticatedUser, generateNote }) => {
    const note = getLastNote(authenticatedUser);
    const updatedNote = cloneNote(note);
    await notesPage.gotoNotes();
    updatedNote.setCategory(NOTE_CATEGORIES.WORK);
    updatedNote.setTitle("Updated " + note.getTitle());
    updatedNote.setDescription("Updated " + note.getDescription());
    updatedNote.setCompleted(true);

    await notesPage.editNote(note, updatedNote);
    await notesPage.verifyNoteAdded(updatedNote);
  });

  test("Delete Note", async ({
    notesPage,
    authenticatedUser,
    generateNote,
  }) => {
    const note = getLastNote(authenticatedUser);
    await notesPage.gotoNotes();
    await notesPage.deleteNote(note);
    await notesPage.verifyNoteDeleted(note);
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
      await notesPage.verifyNoteAdded(note);
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
      await notesPage.verifyNoteAdded(note);
    }
  });
});
