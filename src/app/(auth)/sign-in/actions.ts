"use server";

import { signIn } from "@/auth";
import { ActionResult } from "@/lib/action-error";
import { emailSignInData, emailSignInSchema } from "@/lib/validation";

export default async function emailSignIn(
  data: emailSignInData,
): Promise<ActionResult> {
  const parseResult = emailSignInSchema.safeParse(data);
  if (!parseResult.success) return { error: "Invalid email address" };

  const result = await signIn("resend", {
    email: parseResult.data.email,
    redirect: false,
  });

  // The "signIn" returns a redirect URL with ".../error/..." instead of catchable errors, 'redirect: false' prevents the redirect.
  if (result.includes("error")) {
    return {
      error: `Oops, something went wrong.
      Please try again later...`,
    };
  }
}
