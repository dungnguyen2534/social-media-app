"use server";

import { getSessionData } from "@/auth";
import { ActionResult } from "@/lib/action-error";
import { prisma } from "@/lib/prisma";
import { PostData, getPostDataInclude } from "@/lib/type";
import { createPostSchema } from "@/lib/validation";

export async function editPost({
  postId,
  data,
}: {
  postId: string;
  data: {
    content: string | null;
    mediaIds?: string[];
    sharedPostId?: string;
  };
}): ActionResult<PostData> {
  const session = await getSessionData();
  if (!session || !session.user.id) {
    return { error: "Unauthorized" };
  }

  try {
    const { content, mediaIds, sharedPostId } = createPostSchema.parse(data);

    const currentPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { attachments: { select: { id: true } }, userId: true },
    });

    if (!currentPost) {
      return { error: "Post not found." };
    }

    if (currentPost.userId !== session.user.id) {
      return { error: "You are not authorized to edit this post" };
    }

    // Filter attachments that are not in the new mediaIds
    const currentMediaIds = currentPost.attachments.map((a) => a.id);
    const newMediaIds = mediaIds || [];

    let attachmentIds:
      | {
          connect?: { id: string }[];
          disconnect?: { id: string }[];
        }
      | undefined;

    if (
      !sharedPostId &&
      (currentMediaIds.length > 0 || newMediaIds.length > 0)
    ) {
      // Filter attachments that are not in the new mediaIds
      const mediaIdsToDisconnect = currentMediaIds.filter(
        (id) => !newMediaIds.includes(id),
      );
      const mediaIdsToConnect = newMediaIds.filter(
        (id) => !currentMediaIds.includes(id),
      );

      // Add new/remove old attachments
      attachmentIds = {};
      if (mediaIdsToConnect.length > 0) {
        attachmentIds.connect = mediaIdsToConnect.map((id) => ({ id }));
      }
      if (mediaIdsToDisconnect.length > 0) {
        attachmentIds.disconnect = mediaIdsToDisconnect.map((id) => ({ id }));
      }
    } else if (sharedPostId) {
      if (currentMediaIds.length > 0) {
        attachmentIds = {
          disconnect: currentMediaIds.map((id) => ({ id })),
        };
      }
    }

    const newPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        content,
        sharedPostId,
        attachments: attachmentIds,
      },
      include: getPostDataInclude(session.user.id),
    });

    return newPost;
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong, please try again later." };
  }
}
