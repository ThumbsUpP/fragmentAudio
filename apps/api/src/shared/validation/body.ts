import { badRequest } from "../http/errors.js";

export const requireString = (body: unknown, field: string): string => {
  if (!body || typeof body !== "object") {
    throw badRequest("Request body must be an object");
  }

  const value = (body as Record<string, unknown>)[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw badRequest(`${field} is required`);
  }

  return value.trim();
};

export const optionalString = (body: unknown, field: string): string | null => {
  if (!body || typeof body !== "object") {
    return null;
  }

  const value = (body as Record<string, unknown>)[field];
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw badRequest(`${field} must be a string`);
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};
