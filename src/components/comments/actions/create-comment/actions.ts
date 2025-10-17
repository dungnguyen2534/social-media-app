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
    const { gifDetails, parentCommentId, content } =
      createCommentSchema.parse(data);

    const newComment = await prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          userId: signedInUserId,
          postId: post.id,
          parentCommentId,
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

      if (signedInUserId !== post.userId) {
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
