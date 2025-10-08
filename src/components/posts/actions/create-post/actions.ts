"use server";

import { getSessionData } from "@/auth";
import { ActionResult } from "@/lib/action-error";
import { prisma } from "@/lib/prisma";
import { PostData, getPostDataInclude } from "@/lib/type";
import { createPostSchema } from "@/lib/validation";

export async function submitPost(input: {
  content: string;
  mediaIds?: string[];
  sharedPostId?: string;
}): ActionResult<PostData> {
  const session = await getSessionData();
  if (!session || !session.user.id) {
    return { error: "Unauthorized" };
  }

  try {
    const { content, mediaIds, sharedPostId } = createPostSchema.parse(input);

    // Ensure there are no nested shares, this only happens if a user modifies the frontend code.
    if (sharedPostId) {
      const sharedPostData = await prisma.post.findUnique({
        where: {
          id: sharedPostId,
        },
      });

      if (sharedPostData?.sharedPostId) {
        console.log("Nested share is not allowed.");
        return { error: "Something went wrong, please try again later." };
      }
    }

    const newPost = await prisma.post.create({
      data: {
        content,
        userId: session.user.id,
        sharedPostId,
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
