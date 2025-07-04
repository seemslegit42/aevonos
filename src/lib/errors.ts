
/**
 * @fileOverview Custom error classes for the application, enabling more specific error handling.
 */

/**
 * Custom error thrown when a workspace lacks sufficient credits for an action.
 * This allows the UI to catch this specific error and provide a user-friendly
 * message or prompt to add more credits.
 */
export class InsufficientCreditsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientCreditsError';
  }
}
