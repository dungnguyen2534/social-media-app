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
        // TODO: Get followers list if needed
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
    if (!session?.user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    // upsert (update and insert) ignore the operation instead of throwing error if the follow already exists
    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
      create: {
        followerId: session.user.id,
        followingId: userId,
      },
      update: {},
    });

    return new Response(); // empty success response
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
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    // the couter part of upsert, if things don't exists - do nothing
    await prisma.follow.deleteMany({
      where: {
        followerId: session.user.id,
        followingId: userId,
      },
    });

    return new Response();
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
