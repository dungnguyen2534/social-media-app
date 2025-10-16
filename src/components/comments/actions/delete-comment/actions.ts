"use server";

import { getSessionData } from "@/auth";
import { ActionResult } from "@/lib/action-error";
import { prisma } from "@/lib/prisma";
import { CommentData, getCommentDataInclude } from "@/lib/type";

export async function deleteComment(
  commentId: string,
): ActionResult<CommentData> {
  const session = await getSessionData();
  const userId = session?.user.id;

  if (!session || !userId) {
    return { error: "Unauthorized" };
  }

  try {
    const commentToDelete = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!commentToDelete) {
      return { error: "Comment not found." };
    }

    if (commentToDelete.userId !== userId) {
      return { error: "You are not authorized to delete this comment." };
    }

    const deletedComment = await prisma.comment.delete({
      where: { id: commentId },
      include: getCommentDataInclude(userId),
    });

    return deletedComment;
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong, please try again later." };
  }
}
