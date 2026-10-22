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
