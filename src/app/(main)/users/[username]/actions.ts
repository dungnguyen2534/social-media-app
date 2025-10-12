"use server";

import { getSessionData } from "@/auth";
import { ActionResult } from "@/lib/action-error";
import { prisma } from "@/lib/prisma";
import { getUserDataSelect, UserData } from "@/lib/type";
import { userProfileData, userProfileSchema } from "@/lib/validation";

export async function updateUserProfile(
  data: userProfileData,
): ActionResult<UserData> {
  const session = await getSessionData();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    const validatedData = userProfileSchema.parse(data);

    const existingUser = await prisma.user.findUnique({
      where: { id: session?.user.id },
      select: { username: true, usernameUpdatedAt: true },
    });

    if (!existingUser) {
      return { error: "User not found." };
    }

    const updateData: Partial<
      typeof validatedData & { usernameUpdatedAt: Date }
    > = {
      ...validatedData,
    };

    if (existingUser.username !== validatedData.username) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (
        existingUser.usernameUpdatedAt &&
        existingUser.usernameUpdatedAt.getTime() > thirtyDaysAgo.getTime()
      ) {
        return {
          error: "You can only change your username once every 30 days.",
        };
      }

      updateData.usernameUpdatedAt = new Date();
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: getUserDataSelect(session.user.id),
    });

    return updatedUser;
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong, please try again later." };
  }
}
