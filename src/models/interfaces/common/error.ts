class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

class PsnApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PSN Error";
  }
}

export { AuthenticationError, PsnApiError };
