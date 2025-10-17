"use server";

import { getSessionData } from "@/auth";
import { ActionResult } from "@/lib/action-error";
import { prisma } from "@/lib/prisma";
import { CommentData, getCommentDataInclude } from "@/lib/type";

export async function deleteComment(
  commentId: string,
): ActionResult<CommentData> {
  const session = await getSessionData();
  const signedInUserId = session?.user.id;

  if (!signedInUserId) {
    return { error: "Unauthorized" };
  }

  try {
    const commentToDelete = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: true,
      },
    });

    if (!commentToDelete) {
      return { error: "Comment not found." };
    }

    if (commentToDelete.userId !== signedInUserId) {
      return { error: "You are not authorized to delete this comment." };
    }

    const [deletedComment] = await prisma.$transaction([
      prisma.comment.delete({
        where: { id: commentId },
        include: getCommentDataInclude(signedInUserId),
      }),
      ...(signedInUserId !== commentToDelete.post.userId
        ? [
            prisma.notification.deleteMany({
              where: {
                issuerId: signedInUserId,
                recipientId: commentToDelete.post.userId,
                commentId: commentToDelete.id,
                type: "COMMENT",
              },
            }),
          ]
        : []),
    ]);

    return deletedComment;
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong, please try again later." };
  }
}
