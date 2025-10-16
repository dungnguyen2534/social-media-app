"use server";

import { getSessionData } from "@/auth";
import { ActionError } from "@/lib/action-error";
import { prisma } from "@/lib/prisma";
import { getPostDataInclude, PostData } from "@/lib/type";

export async function deletePost(
  postId: string,
): Promise<PostData | ActionError> {
  const session = await getSessionData();
  if (!session) return { error: "Unauthorized" };

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return { error: "Post not found" };
    if (post.userId !== session.user.id) {
      return { error: "You are not authorized to delete this post" };
    }

    const deletedPost = await prisma.post.delete({
      where: { id: postId },
      include: getPostDataInclude(session.user.id),
    });

    return deletedPost;
  } catch (err) {
    console.log(err);
    return { error: "Something went wrong, please try again later." };
  }
}
