export class FootballApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "FootballApiError";
    this.status = status;
  }
}

export function isRateLimited(error: unknown): boolean {
  return error instanceof FootballApiError && error.status === 429;
}