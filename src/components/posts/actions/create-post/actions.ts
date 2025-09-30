"use server";

import { getSessionData } from "@/auth";
import { ActionResult } from "@/lib/action-error";
import { prisma } from "@/lib/prisma";
import { PostData, getPostDataInclude } from "@/lib/type";
import { createPostSchema } from "@/lib/validation";
import z from "zod";

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
}): ActionResult<PostData> {
  const session = await getSessionData();
  if (!session || !session.user.id) {
    return { error: "Unauthorized" };
  }

  const validation = createPostSchema.safeParse(input);

  if (!validation.success) {
    const formErrors = z.treeifyError(validation.error).errors;
    const errorMessage =
      formErrors.length > 0
        ? formErrors[0]
        : "A post must have either content or at least one attachment.";

    return { error: errorMessage };
  }

  try {
    const { content, mediaIds } = validation.data;
    const newPost = await prisma.post.create({
      data: {
        content,
        userId: session.user.id,
        attachments: mediaIds
          ? {
              connect: mediaIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: getPostDataInclude(session.user.id),
    });

    return newPost;
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong, please try again later." };
  }
}
