import { expect, APIResponse } from "@playwright/test";
import { StatusCodes } from "http-status-codes";

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

// export async function noteAssertions(
//   response: APIResponse,
//   expectedCompleted: string,
//   user: User,
//   noteData?: Note,
// ): Promise<void> {
//   await expectSuccessResponse(
//     response,
//     {
//       id: expect.any(String),
//       title: noteData?.title,
//       description: noteData?.description,
//       category: noteData?.category,
//       completed: expectedCompleted === "true",
//       created_at: expect.any(String),
//       updated_at: expect.any(String),
//       user_id: user.id,
//     },
//     StatusCodes.OK,
//     expectedCompleted === "true"
//       ? "Note successfully Updated"
//       : "Note successfully created",
//   );
// }

export async function expectUpdatedAtGreaterThanCreatedAt(
  response: APIResponse,
  createdAt: string,
): Promise<void> {
  const body = await response.json();
  expect(new Date(body.data.updated_at).getTime()).toBeGreaterThan(
    new Date(createdAt).getTime(),
  );
}
