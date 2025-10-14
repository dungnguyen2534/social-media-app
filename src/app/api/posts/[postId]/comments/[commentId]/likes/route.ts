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
  const userId = session?.user.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { commentId } = await params;

  try {
    await prisma.commentLike.upsert({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
      create: {
        userId,
        commentId,
      },
      update: {},
    });

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
  const userId = session?.user.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { commentId } = await params;

  try {
    await prisma.commentLike.deleteMany({
      where: {
        userId,
        commentId,
      },
    });

    return new Response();
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
