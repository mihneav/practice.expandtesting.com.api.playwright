import {
  request as playwrightRequest,
  APIRequestContext,
  APIResponse,
} from "@playwright/test";
import { User } from "./user";
import { Note } from "./note";
import { test } from "@playwright/test";

export async function deleteUser(user: User): Promise<APIResponse> {
  const request: APIRequestContext = await playwrightRequest.newContext({
    baseURL: test.info().project.use.baseURL,
  });
  const response = await request.delete("users/delete-account", {
    headers: {
      "x-auth-token": user.token,
    },
  });
  return response;
}

export async function deleteNote(user: User, note: Note): Promise<APIResponse> {
  const request: APIRequestContext = await playwrightRequest.newContext({
    baseURL: test.info().project.use.baseURL,
  });
  const response = await request.delete(`notes/${note.id}`, {
    headers: {
      "x-auth-token": user.token,
    },
    data: {
      id: note.id,
    },
  });
  await response.json();
  return response;
}
