import { createAuthClient } from "better-auth/react";

// Relative requests use the current origin in local and production environments.
export const authClient = createAuthClient({});
