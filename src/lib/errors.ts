/**
 * @fileOverview Custom error classes for the application.
 */

/**
 * Custom error for when a workspace lacks sufficient credits.
 */
export class InsufficientCreditsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InsufficientCreditsError';
    }
}
