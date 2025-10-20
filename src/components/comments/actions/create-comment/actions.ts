"use server";

import { getSessionData } from "@/auth";
import { ActionResult } from "@/lib/action-error";
import { prisma } from "@/lib/prisma";
import { CommentData, getCommentDataInclude, PostData } from "@/lib/type";
import { createCommentSchema, gifDetails } from "@/lib/validation";

export async function submitComment({
  post,
  data,
}: {
  post: PostData;
  data: {
    parentCommentId: string | null;
    replyingToId?: string | null;
    content?: string;
    gifDetails?: gifDetails;
  };
}): ActionResult<CommentData> {
  const session = await getSessionData();
  const signedInUserId = session?.user.id;
  if (!signedInUserId) {
    return { error: "Unauthorized" };
  }

  try {
    const { gifDetails, parentCommentId, replyingToId, content } =
      createCommentSchema.parse(data);

    const newComment = await prisma.$transaction(async (tx) => {
      let replyingToComment = null;
      if (replyingToId) {
        replyingToComment = await tx.comment.findUnique({
          where: {
            id: replyingToId,
          },
          select: {
            userId: true,
            parentCommentId: true,
          },
        });
      }

      const comment = await tx.comment.create({
        data: {
          userId: signedInUserId,
          postId: post.id,
          parentCommentId,
          replyingToId,
          content,
          ...(gifDetails
            ? {
                gif: {
                  create: {
                    gifId: gifDetails.gifId,
                    url: gifDetails.url,
                    width: gifDetails.width,
                    height: gifDetails.height,
                    title: gifDetails.title || null,
                  },
                },
              }
            : {}),
        },
        include: getCommentDataInclude(signedInUserId),
      });

      if (replyingToComment && replyingToComment.userId !== signedInUserId) {
        const notificationType = replyingToComment.parentCommentId
          ? "REPLY_TO_REPLY"
          : "REPLY_TO_COMMENT";

        await tx.notification.create({
          data: {
            issuerId: signedInUserId,
            recipientId: replyingToComment.userId,
            commentId: comment.id,
            postId: post.id,
            type: notificationType,
          },
        });
      }

      const isReplyingToPostAuthor = replyingToComment?.userId === post.userId;
      const isCommentingOnOwnPost = signedInUserId === post.userId;

      if (
        !isCommentingOnOwnPost &&
        !isReplyingToPostAuthor &&
        !replyingToComment
      ) {
        await tx.notification.create({
          data: {
            issuerId: signedInUserId,
            recipientId: post.userId,
            commentId: comment.id,
            postId: post.id,
            type: "COMMENT",
          },
        });
      }

      return comment;
    });
    return newComment;
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong, please try again later." };
  }
}
