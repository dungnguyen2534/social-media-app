"use server";

import { getSessionData } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPostSchema } from "@/lib/validation";

export async function submitPost(input: string) {
  const session = await getSessionData();
  if (!session || !session.user.id) {
    return { error: "Unauthorized" };
  }

  const { content } = createPostSchema.parse({ content: input });

  try {
    await prisma.post.create({
      data: {
        content,
        userId: session.user.id,
      },
    });
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong, please try again later." };
  }
}
