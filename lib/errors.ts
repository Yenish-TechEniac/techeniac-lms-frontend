export type ApiErrorCode =
  | 'REQUEST_ERROR'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'REQUEST_TIMEOUT'
  | 'RATE_LIMITED'
  | 'HTTP_ERROR'
  | 'INVALID_RESPONSE'
  | 'LOGOUT_FAILED'
  | 'UNAUTHORIZED'
  | (string & {});

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly status: number;
  public readonly details?: unknown;
  public readonly retryAfter?: number | undefined;

  constructor(
    status: number,
    message: string,
    code: ApiErrorCode = 'REQUEST_ERROR',
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

/**
 * Error formatting utility for extracting descriptive user-friendly error messages
 * from backend API error responses or unexpected error objects.
 */
export function formatErrorMessage(err: unknown, fallback = 'Operation failed'): string {
  if (err && typeof err === 'object') {
    const apiErr = err as { message?: string; details?: unknown };
    if (Array.isArray(apiErr.details) && apiErr.details.length > 0) {
      const messages = apiErr.details
        .map((d: unknown) => {
          if (typeof d === 'object' && d !== null) {
            const entry = d as { message?: unknown; field?: unknown };
            if (typeof entry.message === 'string') return entry.message;
          }
          if (typeof d === 'string') return d;
          return null;
        })
        .filter((m): m is string => Boolean(m));

      if (messages.length > 0) {
        return messages.join('. ');
      }
    }

    if (typeof apiErr.message === 'string' && apiErr.message.trim().length > 0) {
      return apiErr.message;
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}
