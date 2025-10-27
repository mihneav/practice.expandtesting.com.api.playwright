import { test, expect } from "@playwright/test";
import { StatusCodes } from "http-status-codes";
import { User } from "../utils/user";
import { deleteUser } from "../utils/teardown";
import { setupUser, registerUser, loginUser } from "../utils/setup";

test.describe("User API", () => {
  let user: User;

  test.beforeEach(async () => {
    user = await setupUser(await User.createUser());
  });

  test.afterEach(async () => {
    if (user.token) {
      await deleteUser(user);
    }
  });

  test("POST /users/register", async ({ request }) => {
    const user = await User.createUser();
    const response = await registerUser(user);
    const body = await response.json();

    expect(response.status()).toBe(StatusCodes.CREATED);
    expect(body).toEqual({
      success: true,
      status: StatusCodes.CREATED,
      message: "User account created successfully",
      data: {
        id: expect.any(String),
        name: user.username,
        email: user.email,
      },
    });
    expect(body.data.id).toHaveLength(24);
  });

  test("POST /users/login", async ({ request }) => {
    const response = await loginUser(user);

    const body = await response.json();

    expect(response.status()).toBe(StatusCodes.OK);
    expect(body).toEqual({
      success: true,
      status: StatusCodes.OK,
      message: "Login successful",
      data: {
        id: expect.any(String),
        email: user.email,
        name: user.username,
        token: expect.any(String),
      },
    });
    expect(body.data.id).toHaveLength(24);
    expect(body.data.token).toHaveLength(64);

    if (body.data.token && body.data.id) {
      user.token = body.data.token;
      user.id = body.data.id;
    }
  });

  test("GET /users/profile", async ({ request }) => {
    const response = await request.get("users/profile/", {
      headers: {
        "x-auth-token": user.token,
      },
    });

    const body = await response.json();

    expect(response.status()).toBe(StatusCodes.OK);
    expect(body).toEqual({
      success: true,
      status: StatusCodes.OK,
      message: "Profile successful",
      data: {
        id: user.id,
        name: user.username,
        email: user.email,
      },
    });
    expect(body.data.id).toHaveLength(24);
  });

  test("PATCH /users/profile", async ({ request }) => {
    const updatedData = {
      name: user.username + "_updated",
      phone: user.phone + "9",
      company: user.company.substring(0, 25) + " Ltd",
    };

    const response = await request.patch("users/profile/", {
      headers: {
        "x-auth-token": user.token,
      },
      data: updatedData,
    });

    const body = await response.json();

    expect(response.status()).toBe(StatusCodes.OK);
    expect(body).toEqual({
      success: true,
      status: StatusCodes.OK,
      message: "Profile updated successful",
      data: {
        company: updatedData.company,
        email: user.email,
        id: user.id,
        name: updatedData.name,
        phone: updatedData.phone,
      },
    });
    expect(body.data.id).toHaveLength(24);
  });

  test("POST /users/forgot-password", async ({ request }) => {
    const response = await request.post("users/forgot-password", {
      data: {
        email: user.email,
      },
    });

    const body = await response.json();

    expect(response.status()).toBe(StatusCodes.OK);
    expect(body).toEqual({
      success: true,
      status: StatusCodes.OK,
      message: `Password reset link successfully sent to ${user.email}. Please verify by clicking on the given link`,
    });
  });

  test("POST /users/change-password", async ({ request }) => {
    const response = await request.post("users/change-password", {
      headers: {
        "x-auth-token": user.token,
      },
      data: {
        currentPassword: user.password,
        newPassword: "newPassword123",
      },
    });

    const body = await response.json();

    expect(response.status()).toBe(StatusCodes.OK);
    expect(body).toEqual({
      success: true,
      status: StatusCodes.OK,
      message: `The password was successfully updated`,
    });
  });

  test("DELETE /users/logout", async ({ request }) => {
    const response = await request.delete("users/logout", {
      headers: {
        "x-auth-token": user.token,
      },
    });

    const body = await response.json();

    expect(response.status()).toBe(StatusCodes.OK);
    expect(body).toEqual({
      success: true,
      status: StatusCodes.OK,
      message: `User has been successfully logged out`,
    });
  });

  test("GET /users/delete", async ({ request }) => {
    if (user.token) {
      let response = await deleteUser(user);
      const body = await response.json();
      expect(response.status()).toBe(StatusCodes.OK);
      expect(body).toEqual({
        success: true,
        status: StatusCodes.OK,
        message: `Account successfully deleted`,
      });
    }
  });
});
