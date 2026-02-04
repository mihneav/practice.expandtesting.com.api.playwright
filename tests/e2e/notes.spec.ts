import { test, expect } from "@lib/baseE2eTest";
import { generateNoteApi } from "@utils/helpers";
import { API_MESSAGES, NOTE_CATEGORIES } from "@utils/constants";
import { User } from "@utils/user";
import { Note } from "@utils/note";

/**
 * Notes test suite
 * Tests note-related functionality including creating, editing, deleting, filtering, and searching notes
 */
test.describe("Notes", () => {
  /**
   * Setup hook that runs before each test
   * Authenticates user by setting the auth token
   * @param {Object} params - Test parameters
   * @param {User} params.authenticatedUser - The authenticated user object
   * @param {Function} params.setAuthToken - Function to set the authentication token
   */
  test.beforeEach(async ({ authenticatedUser, setAuthToken }) => {
    await setAuthToken(authenticatedUser.getToken());
  });

  /**
   * Cleanup hook that runs after each test
   * Deletes the user account if authentication was successful
   * @param {Object} params - Test parameters
   * @param {User} params.authenticatedUser - The authenticated user object
   * @param {Function} params.deleteUserAccount - Function to delete user account
   */
  test.afterEach(async ({ authenticatedUser, deleteUserAccount }) => {
    if (authenticatedUser.getToken()) {
      await deleteUserAccount(authenticatedUser);
    }
  });

  /**
   * Test adding a new note
   * Verifies that a new note can be successfully created and displayed
   * @param {Object} params - Test parameters
   * @param {NotesPage} params.notesPage - Notes page object
   * @param {Note} params.note - Test note object
   */
  test("Add New Note", async ({ notesPage, note }) => {
    await notesPage.gotoNotes();
    await notesPage.addNewNote(note);
    await notesPage.verifyNote(note);
  });

  /**
   * Test add note form validation
   * Verifies that validation errors are displayed when required note fields are missing
   * @param {Object} params - Test parameters
   * @param {NotesPage} params.notesPage - Notes page object
   */
  test("Add Note Validation", async ({ notesPage }) => {
    await notesPage.gotoNotes();
    await notesPage.openAddNoteModal();
    await notesPage.submitNoteForm();
    await notesPage.verifyNoteValidationErrors([
      API_MESSAGES.TITLE_REQUIRED,
      API_MESSAGES.DESCRIPTION_REQUIRED,
    ]);
  });

  /**
   * Test editing an existing note
   * Verifies that note details can be successfully updated
   * @param {Object} params - Test parameters
   * @param {NotesPage} params.notesPage - Notes page object
   * @param {Note} params.apiCreatedNote - Note created via API
   */
  test("Edit Note", async ({ notesPage, apiCreatedNote }) => {
    const updatedNote = apiCreatedNote.clone();
    await notesPage.gotoNotes();
    updatedNote.setCategory(NOTE_CATEGORIES.WORK);
    updatedNote.setTitle("Updated " + apiCreatedNote.getTitle());
    updatedNote.setDescription("Updated " + apiCreatedNote.getDescription());
    updatedNote.setCompleted(true);

    await notesPage.editNote(apiCreatedNote, updatedNote);
    await notesPage.verifyNote(updatedNote);
  });

  /**
   * Test deleting a note
   * Verifies that a note can be successfully deleted and is no longer visible
   * @param {Object} params - Test parameters
   * @param {NotesPage} params.notesPage - Notes page object
   * @param {Note} params.apiCreatedNote - Note created via API
   */
  test("Delete Note", async ({ notesPage, apiCreatedNote }) => {
    await notesPage.gotoNotes();
    await notesPage.deleteNote(apiCreatedNote);
    await notesPage.verifyNoteDeleted(apiCreatedNote);
  });

  /**
   * Test note category filtering
   * Verifies that notes can be filtered and displayed by their assigned category
   * @param {Object} params - Test parameters
   * @param {NotesPage} params.notesPage - Notes page object
   * @param {APIRequestContext} params.apiContext - API context for making HTTP requests
   * @param {User} params.authenticatedUser - The authenticated user object
   */
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
    await Promise.all(
      categories.map((cat) =>
        generateNoteApi(apiContext, authenticatedUser, cat),
      ),
    );

    await notesPage.gotoNotes();

    for (const note of authenticatedUser.getNotes()) {
      await notesPage.filterByCategory(note.getCategory());
      await notesPage.verifyNote(note);
    }
  });

  /**
   * Test searching notes by title
   * Verifies that notes can be found using the search functionality
   * @param {Object} params - Test parameters
   * @param {NotesPage} params.notesPage - Notes page object
   * @param {APIRequestContext} params.apiContext - API context for making HTTP requests
   * @param {User} params.authenticatedUser - The authenticated user object
   */
  test("Search Notes", async ({ notesPage, apiContext, authenticatedUser }) => {
    const categories = [
      NOTE_CATEGORIES.HOME,
      NOTE_CATEGORIES.WORK,
      NOTE_CATEGORIES.PERSONAL,
    ];
    await Promise.all(
      categories.map((cat) =>
        generateNoteApi(apiContext, authenticatedUser, cat),
      ),
    );
    await notesPage.gotoNotes();

    for (const note of authenticatedUser.getNotes()) {
      await notesPage.searchNoteByTitle(note.getTitle());
      await notesPage.verifyNote(note);
    }
  });

  /**
   * Test note details view
   * Verifies that detailed information for a note is correctly displayed
   * @param {Object} params - Test parameters
   * @param {NotesPage} params.notesPage - Notes page object
   * @param {Note} params.apiCreatedNote - Note created via API
   */
  test("Note Details View", async ({ notesPage, apiCreatedNote }) => {
    await notesPage.gotoNotes();
    await notesPage.openNoteDetails(apiCreatedNote);
    await notesPage.verifyNoteDetails(apiCreatedNote);
  });

  /**
   * Test pagination functionality
   * Verifies that a large number of notes can be displayed with pagination
   * Note: This test simulates a large number of notes to test pagination behavior.
   * Actual pagination controls are not implemented in the UI.
   * @param {Object} params - Test parameters
   * @param {NotesPage} params.notesPage - Notes page object
   * @param {Function} params.mockManyNotes - Function to mock many notes
   */
  test("Pagination", async ({ notesPage, mockManyNotes }) => {
    await mockManyNotes(100);
    await notesPage.gotoNotes();
    await expect(notesPage.noteCard).toHaveCount(100);
  });
});
