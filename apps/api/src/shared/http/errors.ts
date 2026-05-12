import type { ErrorRequestHandler } from "express";

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
  }
}

export const notFound = (message = "Resource not found") => new HttpError(404, message);
export const badRequest = (message = "Bad request") => new HttpError(400, message);

const isDatabaseConflict = (error: unknown) => {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
  );
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  if (isDatabaseConflict(error)) {
    return res.status(409).json({ error: "Resource already exists" });
  }

  console.error(error);
  return res.status(500).json({ error: "Internal server error" });
};
