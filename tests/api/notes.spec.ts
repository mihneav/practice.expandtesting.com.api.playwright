import { test, expect } from "@lib/baseE2eTest";
import { Note } from "@utils/note";
import { sendRequest } from "@utils/helpers";
import { expectSuccessResponse } from "@utils/assertions";
import { StatusCodes } from "http-status-codes";
import { API_ENDPOINTS, API_MESSAGES, HTTP_HEADERS } from "@utils/constants";

/**
 * Notes API test suite
 * Tests CRUD operations for notes including create, retrieve, update, and delete
 */
test.describe("Notes API", () => {
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
   * Test creating a new note via POST endpoint
   * Verifies that a note is successfully created with correct response data
   * @param {Object} params - Test parameters
   * @param {request} params.request - Playwright request object for making HTTP calls
   * @param {User} params.authenticatedUser - The authenticated user object
   */
  test("POST /notes", async ({ request, authenticatedUser }) => {
    const note = await Note.createNote(authenticatedUser.getId()!);
    const response = await sendRequest(request, "post", API_ENDPOINTS.NOTES, {
      headers: {
        [HTTP_HEADERS.AUTH_TOKEN]: authenticatedUser.getToken(),
      },
      data: {
        title: note.getTitle(),
        description: note.getDescription(),
        category: note.getCategory(),
      },
    });

    await expectSuccessResponse(
      response,
      {
        id: expect.any(String),
        title: note.getTitle(),
        description: note.getDescription(),
        category: note.getCategory(),
        completed: false,
        created_at: expect.any(String),
        updated_at: expect.any(String),
        user_id: authenticatedUser.getId(),
      },
      StatusCodes.OK,
      API_MESSAGES.NOTE_CREATED,
    );

    const body = await response.json();
    const createdNote = Note.fromResponse(body.data);

    authenticatedUser.addNote(createdNote);
  });

  /**
   * Test retrieving a note by ID via GET endpoint
   * Verifies that a specific note can be retrieved with correct data
   * @param {Object} params - Test parameters
   * @param {request} params.request - Playwright request object for making HTTP calls
   * @param {User} params.authenticatedUser - The authenticated user object
   * @param {Note} params.apiCreatedNote - Note created via API
   */
  test("GET /notes/{id}", async ({
    request,
    authenticatedUser,
    apiCreatedNote,
  }) => {
    const note = await apiCreatedNote();
    const response = await sendRequest(
      request,
      "get",
      API_ENDPOINTS.NOTE_BY_ID(note.getId()),
      {
        headers: {
          [HTTP_HEADERS.AUTH_TOKEN]: authenticatedUser.getToken(),
        },
      },
    );

    await expectSuccessResponse(
      response,
      {
        id: note.getId(),
        title: note.getTitle(),
        description: note.getDescription(),
        category: note.getCategory(),
        completed: note.getCompleted(),
        created_at: note.getCreatedAt(),
        updated_at: note.getUpdatedAt(),
        user_id: authenticatedUser.getId(),
      },
      StatusCodes.OK,
      API_MESSAGES.NOTE_RETRIEVED,
    );
  });

  /**
   * Test updating a note via PUT endpoint
   * Verifies that a note can be completely updated with new data
   * @param {Object} params - Test parameters
   * @param {request} params.request - Playwright request object for making HTTP calls
   * @param {User} params.authenticatedUser - The authenticated user object
   * @param {Note} params.apiCreatedNote - Note created via API
   */
  test("PUT /notes/{id}", async ({
    request,
    authenticatedUser,
    apiCreatedNote,
  }) => {
    const note = await apiCreatedNote();
    const response = await sendRequest(
      request,
      "put",
      API_ENDPOINTS.NOTE_BY_ID(note.getId()),
      {
        headers: {
          [HTTP_HEADERS.AUTH_TOKEN]: authenticatedUser.getToken(),
        },
        data: {
          id: note.getId(),
          title: note.getTitle(),
          description: note.getDescription(),
          category: note.getCategory(),
          completed: true,
        },
      },
    );

    const body = await response.json();

    await expectSuccessResponse(
      response,
      {
        id: note.getId(),
        title: note.getTitle(),
        description: note.getDescription(),
        category: note.getCategory(),
        completed: true,
        created_at: expect.any(String),
        updated_at: expect.any(String),
        user_id: authenticatedUser.getId(),
      },
      StatusCodes.OK,
      API_MESSAGES.NOTE_UPDATED,
    );

    expect(new Date(body.data.updated_at).getTime()).toBeGreaterThan(
      new Date(note.getCreatedAt()!).getTime(),
    );
  });

  /**
   * Test partially updating a note via PATCH endpoint
   * Verifies that specific fields of a note can be updated without affecting others
   * @param {Object} params - Test parameters
   * @param {request} params.request - Playwright request object for making HTTP calls
   * @param {User} params.authenticatedUser - The authenticated user object
   * @param {Note} params.apiCreatedNote - Note created via API
   */
  test("PATCH /notes/{id}", async ({
    request,
    authenticatedUser,
    apiCreatedNote,
  }) => {
    const note = await apiCreatedNote();
    const response = await sendRequest(
      request,
      "patch",
      API_ENDPOINTS.NOTE_BY_ID(note.getId()),
      {
        headers: {
          [HTTP_HEADERS.AUTH_TOKEN]: authenticatedUser.getToken(),
        },
        data: {
          id: note.getId(),
          completed: true,
        },
      },
    );

    const body = await response.json();

    await expectSuccessResponse(response, {
      id: note.getId(),
      title: note.getTitle(),
      description: note.getDescription(),
      category: note.getCategory(),
      completed: true,
      created_at: expect.any(String),
      updated_at: expect.any(String),
      user_id: authenticatedUser.getId(),
    });
    expect(body.message).toBe(API_MESSAGES.NOTE_UPDATED);

    expect(new Date(body.data.updated_at).getTime()).toBeGreaterThan(
      new Date(note.getCreatedAt()!).getTime(),
    );
  });

  /**
   * Test deleting a note via DELETE endpoint
   * Verifies that a note can be successfully deleted
   * @param {Object} params - Test parameters
   * @param {User} params.authenticatedUser - The authenticated user object
   * @param {Note} params.apiCreatedNote - Note created via API
   * @param {Function} params.deleteNoteById - Function to delete note by ID
   */
  test("DELETE /notes/{id}", async ({
    authenticatedUser,
    apiCreatedNote,
    deleteNoteById,
  }) => {
    const response = await deleteNoteById(
      authenticatedUser,
      await apiCreatedNote(),
    );
    const body = await response.json();

    await expectSuccessResponse(response);
    expect(body.message).toBe(API_MESSAGES.NOTE_DELETED);
  });
});
