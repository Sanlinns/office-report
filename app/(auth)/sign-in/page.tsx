import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import SignInForm from "./sign-in-form";

export default async function SignInPage() {
  const session = await getSession();
  if (session?.user.id) redirect("/dashboard");
  return <SignInForm />;
}
