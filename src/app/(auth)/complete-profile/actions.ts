"use server";

import { getSessionData } from "@/auth";
import { ActionResult } from "@/lib/action-error";
import { prisma } from "@/lib/prisma";
import streamSeverClient from "@/lib/stream";
import { userProfileData, userProfileSchema } from "@/lib/validation";

export async function completeProfile(
  userId: string,
  data: userProfileData,
): ActionResult<void> {
  const session = getSessionData();
  if (!session) return { error: "Unauthorized" };

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

    await prisma.$transaction(async (tx) => {
      const userData = await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          name,
          username,
        },
      });

      await streamSeverClient.upsertUser({
        id: userData.id,
        username: userData.name!,
        name: userData.name!,
        image: userData.image ?? undefined,
      });
    });
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong, please try gain later." };
  }
}
