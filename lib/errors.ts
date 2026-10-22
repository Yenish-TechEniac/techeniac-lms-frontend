export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;
  public readonly retryAfter?: number | undefined;

  constructor(
    status: number,
    message: string,
    code = 'REQUEST_ERROR',
    details?: unknown,
    retryAfter?: number,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.retryAfter = retryAfter;
  }
}
