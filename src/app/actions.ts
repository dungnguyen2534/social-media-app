"use server";

import { auth } from "@/auth";
import { ActionResult } from "@/lib/action-error";
import { prisma } from "@/lib/prisma";
import { onboardingSchema, OnboardingValues } from "@/lib/validation";

export async function completeOnboarding(
  values: OnboardingValues,
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session) {
      return { error: "User not authenticated" };
    }

    const { name, username } = onboardingSchema.parse(values);

    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive", // Case-insensitive check ("A" = "a")
        },
      },
    });

    if (existingUsername) {
      return { error: "Username already taken" };
    }

    await prisma.user.update({
      where: {
        email: session.user.email!,
      },
      data: {
        name,
        username,
        isOnboarded: true,
      },
    });
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong" };
  }
}
