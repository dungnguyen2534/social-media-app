"use server";

import { getSessionData } from "@/auth";
import { ActionResult } from "@/lib/action-error";
import { prisma } from "@/lib/prisma";
import { PostData, postDataInclude } from "@/lib/type";
import { createPostSchema } from "@/lib/validation";

export async function submitPost(input: string): ActionResult<PostData> {
  const session = await getSessionData();
  if (!session || !session.user.id) {
    return { error: "Unauthorized" };
  }

  const { content } = createPostSchema.parse({ content: input });

  try {
    const newPost = await prisma.post.create({
      data: {
        content,
        userId: session.user.id,
      },
      include: postDataInclude,
    });

    return newPost;
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong, please try again later." };
  }
}
