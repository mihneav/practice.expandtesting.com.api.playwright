import { APIRequestContext } from "@playwright/test";
import { User } from "@utils/user";
import { Note } from "@utils/note";
import { APIResponse } from "@playwright/test";
import { HTTP_HEADERS } from "@utils/constants";

/**
 * Normalizes an HTTP method string to lowercase
 *
 * @param httpMethod - HTTP method string (GET, POST, PUT, PATCH, DELETE)
 * @returns Lowercase HTTP method type
 *
 * @example
 * const method = getMethod("GET"); // "get"
 */
export function getMethod(httpMethod: string) {
  return httpMethod.toLowerCase() as
    | "get"
    | "post"
    | "put"
    | "patch"
    | "delete";
}

/**
 * Sends an HTTP request using the specified method and options
 *
 * @param request - Playwright APIRequestContext
 * @param method - HTTP method as string
 * @param endpoint - API endpoint URL
 * @param options - Optional request options (headers, data, etc.)
 * @returns API response
 *
 * @example
 * const response = await sendRequest(request, "get", "/api/notes");
 */
export async function sendRequest(
  request: APIRequestContext,
  method: "get" | "post" | "put" | "patch" | "delete",
  endpoint: string,
  options?: { headers?: Record<string, string>; data?: any },
): Promise<APIResponse> {
  return request[method](endpoint, options);
}

/**
 * Creates a new note via API and adds it to the user's notes collection
 *
 * @param apiContext - Playwright API request context
 * @param authenticatedUser - User object with valid authentication token
 * @param category - Optional note category (Home, Work, or Personal)
 * @returns API response from note creation request
 *
 * @example
 * const response = await generateNoteApi(apiContext, user, "Work");
 */
export async function generateNoteApi(
  apiContext: APIRequestContext,
  authenticatedUser: User,
  category?: string,
): Promise<APIResponse> {
  const note = await Note.createNote(authenticatedUser.getId(), category);

  const response = await apiContext.post("notes/", {
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
  return response;
}

/**
 * Deletes a note via API and removes it from the user's notes collection
 *
 * @param apiContext - Playwright API request context
 * @param authenticatedUser - User object with valid authentication token
 * @param note - Note object to delete
 * @returns API response from note deletion request
 *
 * @example
 * const response = await deleteNoteApi(apiContext, user, note);
 */
export async function deleteNoteApi(
  apiContext: APIRequestContext,
  authenticatedUser: User,
  note: Note,
): Promise<APIResponse> {
  const response = await apiContext.delete(`notes/${note.getId()}`, {
    headers: {
      [HTTP_HEADERS.AUTH_TOKEN]: authenticatedUser.getToken(),
    },
  });

  if (response.ok()) {
    authenticatedUser.removeNote(note);
  }

  return response;
}
/**
 * Logs in a user via API
 *
 * @param apiContext - Playwright API request context
 * @param user - User object with email and password
 * @returns API response from user login request
 *
 * @example
 * const response = await loginUserApi(apiContext, user);
 */
export async function loginUserApi(
  apiContext: APIRequestContext,
  user: User,
): Promise<APIResponse> {
  const response = await apiContext.post("users/login", {
    data: {
      email: user.getEmail(),
      password: user.getPassword(),
    },
  });

  return response;
}
