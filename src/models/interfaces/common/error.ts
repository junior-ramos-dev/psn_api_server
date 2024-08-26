class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

class PsnAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PSN Error";
  }
}

export { AuthenticationError, PsnAuthError };
