
// This middleware is intentionally left empty.
// The mock authentication system in `src/lib/auth.ts` handles session logic
// without the need for NextAuth middleware, which was causing build conflicts.
export function middleware() {}

export const config = {
  matcher: [],
};
