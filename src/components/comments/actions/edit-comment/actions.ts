"use server";

import { getSessionData } from "@/auth";
import { ActionResult } from "@/lib/action-error";
import { prisma } from "@/lib/prisma";
import { CommentData, getCommentDataInclude } from "@/lib/type";
import { createCommentSchema, gifDetails } from "@/lib/validation";
import { Prisma } from "@prisma/client";

export async function editComment({
  commentId,
  data,
}: {
  commentId: string;
  data: {
    content?: string;
    gifDetails?: gifDetails;
  };
}): ActionResult<CommentData> {
  const session = await getSessionData();
  const userId = session?.user.id;

  if (!session || !userId) {
    return { error: "Unauthorized" };
  }

  try {
    const { gifDetails, content } = createCommentSchema.parse(data);

    const commentToEdit = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        gif: true,
      },
    });

    if (!commentToEdit) {
      return { error: "Comment not found." };
    }

    if (commentToEdit.userId !== userId) {
      return { error: "You are not authorized to edit this comment." };
    }

    const updateData: Prisma.CommentUpdateInput = {
      content,
    };

    const currentGifId = commentToEdit.gif?.id;
    if (gifDetails) {
      const newGifId = gifDetails.gifId;

      if (currentGifId) {
        if (newGifId !== currentGifId) {
          updateData.gif = {
            update: {
              gifId: newGifId,
              url: gifDetails.url,
              width: gifDetails.width,
              height: gifDetails.height,
              title: gifDetails.title || null,
            },
          };
        }
      } else {
        updateData.gif = {
          create: {
            gifId: newGifId,
            url: gifDetails.url,
            width: gifDetails.width,
            height: gifDetails.height,
            title: gifDetails.title || null,
          },
        };
      }
    } else if (currentGifId) {
      updateData.gif = {
        delete: true,
      };
    }

    const newComment = await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: updateData,
      include: getCommentDataInclude(userId),
    });

    return newComment;
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong, please try again later." };
  }
}
