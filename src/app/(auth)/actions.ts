"use server";

import { ActionResult } from "@/lib/action-error";
import { prisma } from "@/lib/prisma";
import { userProfileData, userProfileSchema } from "@/lib/validation";

export async function completeProfile(
  userId: string,
  data: userProfileData
): Promise<ActionResult> {
  try {
    const { name, username } = userProfileSchema.parse(data);

    const existingUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUsername) return { error: "Username already taken" };

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        username,
      },
    });
  } catch (error) {
    console.log(error);
    return { error: "Something went wrong." };
  }
}
