"use server";

import { getSessionData } from "@/auth";
import { ActionResult } from "@/lib/action-error";
import { prisma } from "@/lib/prisma";
import { CommentData, getCommentDataInclude, PostData } from "@/lib/type";
import { createCommentSchema } from "@/lib/validation";

export async function submitComment({
  post,
  data,
}: {
  post: PostData;
  data: {
    parentCommentId: string | null;
    content: string;
  };
}): ActionResult<CommentData> {
  const session = await getSessionData();
  if (!session || !session.user.id) {
    return { error: "Unauthorized" };
  }

  try {
    const { content, parentCommentId } = createCommentSchema.parse(data);

    const newComment = await prisma.comment.create({
      data: {
        userId: session.user.id,
        postId: post.id,
        parentCommentId,
        content,
      },
      include: getCommentDataInclude(session.user.id),
    });

    return newComment;
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong, please try again later." };
  }
}
