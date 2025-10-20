import { getSessionData } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CommentLikeInfo } from "@/lib/type";
import { NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  const session = await getSessionData();
  const userId = session?.user.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { commentId } = await params;

  try {
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        likes: {
          where: {
            userId,
          },
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!comment) {
      return Response.json({ error: "Comment not found" }, { status: 404 });
    }

    const data: CommentLikeInfo = {
      likes: comment._count.likes,
      isLikedByUser: !!comment.likes.length,
    };

    return Response.json(data);
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  _: Request,
  { params }: { params: Promise<{ commentId: string }> },
) {
  const session = await getSessionData();
  const signedInUserId = session?.user.id;
  if (!signedInUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { commentId } = await params;

  try {
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      return Response.json({ error: "Comment not found" }, { status: 404 });
    }

    const isReply = !!comment.parentCommentId;

    await prisma.$transaction([
      prisma.commentLike.upsert({
        where: {
          userId_commentId: {
            userId: signedInUserId,
            commentId,
          },
        },
        create: {
          userId: signedInUserId,
          commentId,
        },
        update: {},
      }),
      ...(signedInUserId !== comment.userId
        ? [
            prisma.notification.create({
              data: {
                issuerId: signedInUserId,
                recipientId: comment.userId,
                postId: comment.postId,
                commentId,
                type: isReply ? "LIKE_REPLY" : "LIKE_COMMENT",
              },
            }),
          ]
        : []),
    ]);

    return new Response();
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ commentId: string }> },
) {
  const session = await getSessionData();
  const signedInUserId = session?.user.id;
  if (!signedInUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { commentId } = await params;

  try {
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      return Response.json({ error: "Comment not found" }, { status: 404 });
    }

    const isReply = !!comment.parentCommentId;

    await prisma.$transaction([
      prisma.commentLike.deleteMany({
        where: {
          userId: signedInUserId,
          commentId,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: signedInUserId,
          recipientId: comment.userId,
          commentId: comment.id,
          type: isReply ? "LIKE_REPLY" : "LIKE_COMMENT",
        },
      }),
    ]);

    return new Response();
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
