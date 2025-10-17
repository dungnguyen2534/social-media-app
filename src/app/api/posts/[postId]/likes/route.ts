import { getSessionData } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LikeInfo } from "@/lib/type";
import { NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const session = await getSessionData();
  const signedInUserId = session?.user.id;
  if (!signedInUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await params;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        likes: {
          where: {
            userId: signedInUserId,
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

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const data: LikeInfo = {
      likes: post._count.likes,
      isLikedByUser: !!post.likes.length,
    };

    return Response.json(data);
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  _: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const session = await getSessionData();
  const signedInUserId = session?.user.id;
  if (!signedInUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await params;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        userId: true,
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.postLike.upsert({
        where: {
          userId_postId: {
            userId: signedInUserId,
            postId,
          },
        },
        create: {
          userId: signedInUserId,
          postId,
        },
        update: {},
      }),
      ...(signedInUserId !== post.userId
        ? [
            prisma.notification.create({
              data: {
                issuerId: signedInUserId,
                recipientId: post.userId,
                postId,
                type: "LIKE",
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
  { params }: { params: Promise<{ postId: string }> },
) {
  const session = await getSessionData();
  const signedInUserId = session?.user.id;
  if (!signedInUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await params;

  try {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        userId: true,
      },
    });

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.postLike.deleteMany({
        where: {
          userId: signedInUserId,
          postId,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: signedInUserId,
          recipientId: post.userId,
          postId,
          type: "LIKE",
        },
      }),
    ]);

    return new Response();
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
