"use server";

import { getSessionData } from "@/auth";
import { ActionResult } from "@/lib/action-error";
import { prisma } from "@/lib/prisma";
import { getUserDataSelect, UserData } from "@/lib/type";
import { userProfileData, userProfileSchema } from "@/lib/validation";

export async function updateUserProfile(
  data: userProfileData,
): ActionResult<UserData> {
  const validatedData = userProfileSchema.parse(data);

  const session = await getSessionData();
  if (!session) return { error: "Unauthorized" };

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: validatedData,
      select: getUserDataSelect(session.user.id),
    });

    return updatedUser;
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong, please try again later." };
  }
}
