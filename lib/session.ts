import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Always validate against the session store, including expiry and revocation.
export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user.id) redirect("/sign-in");
  return session;
}

export async function unauthorizedResponse() {
  const session = await getSession();
  return session?.user.id
    ? null
    : NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}
