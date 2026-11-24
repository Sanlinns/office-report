This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Authentication environments

Set these values separately; never copy production credentials into local tests.

Local `.env.local` (placeholders; supply your own local secret and local Mongo URI):

```dotenv
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=<unique-local-secret-at-least-32-characters>
MONGODB_URL=<local-or-isolated-test-mongodb-uri>
```

Production hosting environment (use its secret manager):

```dotenv
BETTER_AUTH_URL=https://<production-host>
BETTER_AUTH_SECRET=<different-production-secret-at-least-32-characters>
MONGODB_URL=<existing-production-mongodb-uri>
```

The browser auth client uses the current origin. Keep the existing database path in
MONGODB_URL: Better Auth uses `client.db()` (URI-selected database), and the accounting
Mongoose connection still explicitly uses `dailydata`. Existing collection names,
seven-day sessions, and one-day updateAge are unchanged. Do not change the auth
URI database path when separating environments or existing users/sessions will
appear missing. Keep Google OAuth credentials and callback origins appropriate
for each environment if Google sign-in is used.

Dashboard entry, Server Actions, financial data helpers, and financial APIs validate
sessions on the server. Protected checks bypass the cookie cache to reject expired
or revoked sessions immediately. Middleware only redirects missing-cookie requests;
it never redirects sign-in based on cookie presence. This follows the
[Better Auth Next.js guidance](https://better-auth.com/docs/integrations/next).

Password reset email delivery is **not configured**. Development logs the reset URL;
other environments never log it and the sender fails explicitly until an email
provider is connected.

### Remaining data isolation work

Income, Outcome, Remittance and DailyNote have no office/owner scope. Session
protection requires a valid account but does not isolate these shared records
between authenticated accounts. A separate, explicitly approved office membership
model, ownership mapping for legacy records, and scoped queries/writes are still
needed. Do not assign historical records to an arbitrary account. Existing ownerId
filters on products, categories, purchases and sales remain in place. No database
migration is performed by this change.

### Session regression tests

```sh
node --test tests/session-protection.test.cjs
npx tsc --noEmit --incremental false
npm run lint
git diff --check
```

The tests use Better Auth's in-memory adapter and DB spies; they never load `.env`
or connect to MongoDB. They cover anonymous financial API handlers, expired/revoked
sessions with cached cookies, dashboard/sign-in redirects, valid session entry,
and anonymous income/outcome Server Actions. Real purchase/sale ledger operations
still need an isolated local MongoDB and a test account for browser verification.
