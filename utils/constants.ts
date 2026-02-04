export const API_BASE_URL =
  process.env.API_BASE_URL || "https://practice.expandtesting.com/notes/api/";

export const API_ENDPOINTS = {
  // Health
  HEALTH_CHECK: "/notes/api/health-check",

  // Users
  USERS_REGISTER: "/notes/api/users/register",
  USERS_LOGIN: "/notes/api/users/login",
  USERS_PROFILE: "/notes/api/users/profile",
  USERS_FORGOT_PASSWORD: "/notes/api/users/forgot-password",
  USERS_VERIFY_RESET_TOKEN: "/notes/api/users/verify-reset-password-token",
  USERS_RESET_PASSWORD: "/notes/api/users/reset-password",
  USERS_CHANGE_PASSWORD: "/notes/api/users/change-password",
  USERS_LOGOUT: "/notes/api/users/logout",
  USERS_DELETE_ACCOUNT: "/notes/api/users/delete-account",

  // Notes
  NOTES: "/notes/api/notes/",
  NOTE_BY_ID: (id: string) => `/notes/api/notes/${id}`,
} as const;

export const API_MESSAGES = {
  // Health messages
  HEALTH_CHECK_OK: "Notes API is Running",

  // User messages
  USER_CREATED: "User account created successfully",
  LOGIN_SUCCESSFUL: "Login successful",
  PROFILE_SUCCESSFUL: "Profile successful",
  PROFILE_UPDATED: "Profile updated successful",
  PASSWORD_RESET_SENT: (email: string) =>
    `Password reset link successfully sent to ${email}. Please verify by clicking on the given link`,
  PASSWORD_UPDATED: "The password was successfully updated",
  LOGOUT_SUCCESSFUL: "User has been successfully logged out",
  ACCOUNT_DELETED: "Account successfully deleted",
  LOGIN_ERROR: "Incorrect email address or password",
  USER_EXISTS: "An account already exists with the same email address",

  // Note messages
  NOTE_CREATED: "Note successfully created",
  NOTE_RETRIEVED: "Note successfully retrieved",
  NOTE_UPDATED: "Note successfully Updated",
  NOTE_DELETED: "Note successfully deleted",

  // Validation messages
  EMAIL_REQUIRED: "Email address is required",
  EMAIL_INVALID: "Email address is invalid",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_LENGTH: "Password should be between 6 and 30 characters",
  TITLE_REQUIRED: "Title is required",
  DESCRIPTION_REQUIRED: "Description is required",
} as const;

export const UI_MESSAGES = {
  PROFILE_USER_NAME_REQUIRED: "User name is required",
  PROFILE_PHONE_NUMBER_LENGTH: "Phone number should be between 8 and 20 digits",
  PROFILE_CURRENT_PASSWORD_REQUIRED: "Current password is required",
  PROFILE_NEW_PASSWORD_REQUIRED: "New password is required",
  PROFILE_CONFIRM_PASSWORD_REQUIRED: "Confirm password is required",
};

export const TEST_CONFIG = {
  ID_LENGTH: 24,
  TOKEN_LENGTH: 64,
  COMPANY_NAME_MAX_LENGTH: 25,
} as const;

export const NOTE_CATEGORIES = {
  HOME: "Home",
  WORK: "Work",
  PERSONAL: "Personal",
  ALL: "All",
} as const;

export const HTTP_HEADERS = {
  AUTH_TOKEN: "x-auth-token",
} as const;
