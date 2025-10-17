import { getSessionData } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FollowerInfo } from "@/lib/type";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const session = await getSessionData();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: { followerId: session.user.id },
          select: { followerId: true },
        },
        _count: {
          select: { followers: true },
        },
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const data: FollowerInfo = {
      followerCount: user._count.followers,
      isFollowing: user.followers.length > 0,
    };

    return Response.json(data);
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  _: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const session = await getSessionData();
    const signedInUserId = session?.user.id;
    if (!signedInUserId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    await prisma.$transaction([
      prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: signedInUserId,
            followingId: userId,
          },
        },
        create: {
          followerId: signedInUserId,
          followingId: userId,
        },
        update: {},
      }),
      prisma.notification.create({
        data: {
          issuerId: signedInUserId,
          recipientId: userId,
          type: "FOLLOW",
        },
      }),
    ]);

    return new Response();
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const session = await getSessionData();
    const signedInUserId = session?.user.id;
    if (!signedInUserId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    await prisma.$transaction([
      prisma.follow.deleteMany({
        where: {
          followerId: signedInUserId,
          followingId: userId,
        },
      }),
      prisma.notification.deleteMany({
        where: {
          issuerId: signedInUserId,
          recipientId: userId,
          type: "FOLLOW",
        },
      }),
    ]);

    return new Response();
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
