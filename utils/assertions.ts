import { expect, APIResponse } from "@playwright/test";
import { StatusCodes } from "http-status-codes";

/**
 * Validates that an API response indicates success with expected data
 *
 * @param response - The API response to validate
 * @param expectedData - Optional object to match against response.data
 * @param expectedStatus - HTTP status code, defaults to 200 OK
 * @param expectedMessage - Optional message string to match against response.message
 * @throws AssertionError if any expectation fails
 *
 * @example
 * await expectSuccessResponse(response, { id: "123" }, StatusCodes.CREATED, "User created");
 */
export async function expectSuccessResponse(
  response: APIResponse,
  expectedData?: Object,
  expectedStatus: number = StatusCodes.OK,
  expectedMessage?: string,
): Promise<void> {
  expect(response.status()).toBe(expectedStatus);

  const body = await response.json();
  expect(body.success).toBe(true);
  expect(body.status).toBe(expectedStatus);

  if (expectedData) {
    expect(body.data).toEqual(expectedData);
  }
  if (expectedMessage) {
    expect(body.message).toBe(expectedMessage);
  }
}

/**
 * Validates that the updated_at timestamp is greater than created_at timestamp
 *
 * @param response - The API response containing timestamps
 * @param createdAt - ISO 8601 timestamp string of creation time
 * @throws AssertionError if updated_at is not greater than createdAt
 *
 * @example
 * await expectUpdatedAtGreaterThanCreatedAt(response, note.getCreatedAt());
 */
export async function expectUpdatedAtGreaterThanCreatedAt(
  response: APIResponse,
  createdAt: string,
): Promise<void> {
  const body = await response.json();
  expect(new Date(body.data.updated_at).getTime()).toBeGreaterThan(
    new Date(createdAt).getTime(),
  );
}
