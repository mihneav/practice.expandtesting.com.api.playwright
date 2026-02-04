import { test, expect } from "@lib/baseE2eTest";
import { Note } from "@utils/note";
import { deleteNoteApi, sendRequest, getMethod } from "@utils/helpers";
import { expectSuccessResponse } from "@utils/assertions";
import { StatusCodes } from "http-status-codes";
import { API_ENDPOINTS, API_MESSAGES, HTTP_HEADERS } from "@utils/constants";

test.describe("Notes API", () => {
  test.afterEach(async ({ authenticatedUser, deleteUserAccount }) => {
    if (authenticatedUser.getToken()) {
      await deleteUserAccount(authenticatedUser);
    }
  });

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

  test("GET /notes/{id}", async ({
    request,
    authenticatedUser,
    apiCreatedNote,
  }) => {
    const note = authenticatedUser.getNotes()[0];
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

  test("PUT /notes/{id}", async ({
    request,
    authenticatedUser,
    apiCreatedNote,
  }) => {
    const note = authenticatedUser.getNotes()[0];
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

  test("PATCH /notes/{id}", async ({
    request,
    authenticatedUser,
    apiCreatedNote,
  }) => {
    const note = authenticatedUser.getNotes()[0];
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

  test("DELETE /notes/{id}", async ({
    request,
    apiContext,
    authenticatedUser,
    apiCreatedNote,
  }) => {
    const response = await deleteNoteApi(
      apiContext,
      authenticatedUser,
      authenticatedUser.getNotes()[0],
    );

    const body = await response.json();

    await expectSuccessResponse(response);
    expect(body.message).toBe(API_MESSAGES.NOTE_DELETED);
  });
});
