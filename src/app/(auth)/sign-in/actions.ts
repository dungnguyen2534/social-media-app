"use server";

import { signIn } from "@/auth";
import { ActionResult } from "@/lib/action-error";
import { emailSignInSchema } from "@/lib/validation";

export default async function emailSignIn(
  formData: FormData,
): Promise<ActionResult> {
  const email = formData.get("email");
  const parseResult = emailSignInSchema.safeParse({ email });

  if (!parseResult.success) return { error: "Invalid email address" };

  await signIn("resend", formData);
}
