import {
  request as playwrightRequest,
  APIRequestContext,
  expect,
  APIResponse,
} from "@playwright/test";
import { StatusCodes } from "http-status-codes";
import { User } from "./user";
import { test } from "@playwright/test";
import { Note } from "./note";

export async function setupUser(user: User): Promise<User> {
  const registerResponse = await registerUser(user);

  if (
    registerResponse.status() !== StatusCodes.CREATED &&
    registerResponse.status() !== StatusCodes.CONFLICT
  ) {
    const body = await registerResponse.text();
    throw new Error(
      `Registration failed: ${registerResponse.status()} - ${body}`
    );
  }

  const loginResponse = await loginUser(user);

  const loginBody = await loginResponse.json();

  expect(loginResponse.status()).toBe(StatusCodes.OK);
  expect(loginBody.success).toBe(true);
  expect(loginBody.data.token).toBeTruthy();

  user.id = loginBody.data.id;
  user.token = loginBody.data.token;

  return user;
}

export async function registerUser(user: User): Promise<APIResponse> {
  const request: APIRequestContext = await playwrightRequest.newContext({
    baseURL: test.info().project.use.baseURL,
  });
  const data = {
    data: {
      name: user.username,
      email: user.email,
      password: user.password,
    },
  };

  const registerResponse = await request.post("users/register/", data);
  return registerResponse;
}

export async function loginUser(user: User): Promise<APIResponse> {
  const request: APIRequestContext = await playwrightRequest.newContext({
    baseURL: test.info().project.use.baseURL,
  });
  const loginResponse = await request.post("users/login/", {
    data: {
      email: user.email,
      password: user.password,
    },
  });
  return loginResponse;
}

export async function generateNote(user: User): Promise<APIResponse> {
  const request: APIRequestContext = await playwrightRequest.newContext({
    baseURL: test.info().project.use.baseURL,
  });
  const note = await Note.createNote(user.id!);
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

  let body = await response.json();
  user.addNote(body.data as Note);
  return response;
}
