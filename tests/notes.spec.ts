import { test, expect } from "@playwright/test";
import { StatusCodes } from "http-status-codes";
import { User } from "../utils/user";
import { deleteUser, deleteNote } from "../utils/teardown";
import { setupUser, generateNote } from "../utils/setup";
import { Note } from "../utils/note";

test.describe("Notes API", () => {
  let user: User;
  let note: Note;

  test.beforeEach(async () => {
    user = await setupUser(await User.createUser());
    note = await Note.createNote(user.id!);
  });

  test.afterEach(async () => {
    if (user.notes.length > 0) {
      for (const noteId of user.notes) {
        await deleteNote(user, noteId);
      }
    }
    if (user.token) {
      await deleteUser(user);
    }
  });

  test("POST /notes", async ({ request }) => {
    const response = await request.post("notes/", {
      headers: {
        "x-auth-token": user.token,
      },
      data: {
        title: note.title,
        description: note.description,
        category: note.category,
      },
    });

    const body = await response.json();

    expect(response.status()).toBe(StatusCodes.OK);
    expect(body).toEqual({
      success: true,
      status: StatusCodes.OK,
      message: "Note successfully created",
      data: {
        id: expect.any(String),
        title: note.title,
        description: note.description,
        category: note.category,
        completed: false, // note.completed,
        created_at: expect.any(String),
        updated_at: expect.any(String),
        user_id: user.id,
      },
    });
    user.addNote(body.data as Note);
  });

  test("GET /notes/{id}", async ({ request }) => {
    const noteResponse = await (await generateNote(user)).json();
    const response = await request.get(`notes/${noteResponse.data.id}`, {
      headers: {
        "x-auth-token": user.token,
      },
    });

    const body = await response.json();

    expect(response.status()).toBe(StatusCodes.OK);
    expect(body).toEqual({
      success: true,
      status: StatusCodes.OK,
      message: "Note successfully retrieved",
      data: {
        id: noteResponse.data.id,
        title: noteResponse.data.title,
        description: noteResponse.data.description,
        category: noteResponse.data.category,
        completed: noteResponse.data.completed,
        created_at: noteResponse.data.created_at,
        updated_at: noteResponse.data.updated_at,
        user_id: user.id,
      },
    });
  });

  test("PUT /notes/{id}", async ({ request }) => {
    const noteResponse = await (await generateNote(user)).json();
    const response = await request.put(`notes/${noteResponse.data.id}`, {
      headers: {
        "x-auth-token": user.token,
      },
      data: {
        id: noteResponse.data.id,
        title: noteResponse.data.title,
        description: noteResponse.data.description,
        category: noteResponse.data.category,
        completed: true,
      },
    });

    const body = await response.json();

    expect(response.status()).toBe(StatusCodes.OK);
    expect(body).toEqual({
      success: true,
      status: StatusCodes.OK,
      message: "Note successfully Updated",
      data: {
        id: noteResponse.data.id,
        title: noteResponse.data.title,
        description: noteResponse.data.description,
        category: noteResponse.data.category,
        completed: true,
        created_at: expect.any(String),
        updated_at: expect.any(String),
        user_id: user.id,
      },
    });

    expect(new Date(body.data.updated_at).getTime()).toBeGreaterThan(
      new Date(noteResponse.data.created_at).getTime()
    );
  });

  test("PATCH /notes/{id}", async ({ request }) => {
    const noteResponse = await (await generateNote(user)).json();
    const response = await request.patch(`notes/${noteResponse.data.id}`, {
      headers: {
        "x-auth-token": user.token,
      },
      data: {
        id: noteResponse.data.id,
        completed: true,
      },
    });

    const body = await response.json();

    expect(response.status()).toBe(StatusCodes.OK);
    expect(body).toEqual({
      success: true,
      status: StatusCodes.OK,
      message: "Note successfully Updated",
      data: {
        id: noteResponse.data.id,
        title: noteResponse.data.title,
        description: noteResponse.data.description,
        category: noteResponse.data.category,
        completed: true,
        created_at: expect.any(String),
        updated_at: expect.any(String),
        user_id: user.id,
      },
    });

    expect(new Date(body.data.updated_at).getTime()).toBeGreaterThan(
      new Date(noteResponse.data.created_at).getTime()
    );
  });

  test("DELETE /notes/{id}", async ({ request }) => {
    const noteResponse = await (await generateNote(user)).json();
    const response = await deleteNote(user, noteResponse.data);

    const body = await response.json();

    expect(response.status()).toBe(StatusCodes.OK);
    expect(body).toEqual({
      success: true,
      status: StatusCodes.OK,
      message: "Note successfully deleted",
    });
  });
});
