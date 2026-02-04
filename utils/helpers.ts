import { APIRequestContext } from "@playwright/test";
import { User } from "@utils/user";
import { Note } from "@utils/note";
import { APIResponse } from "@playwright/test";
import { HTTP_HEADERS } from "@utils/constants";

/**
 * Normalizes an HTTP method string to lowercase
 *
 * @param {string} httpMethod - HTTP method string (GET, POST, PUT, PATCH, DELETE)
 * @returns { "get" | "post" | "put" | "patch" | "delete" } Lowercase HTTP method type
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
 * @param {APIRequestContext} request - Playwright APIRequestContext
 * @param { "get" | "post" | "put" | "patch" | "delete" } method - HTTP method as string
 * @param {string} endpoint - API endpoint URL
 * @param {Object} [options] - Optional request options (headers, data, etc.)
 * @returns {Promise<APIResponse>} API response
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
