import { getSessionData } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FollowingInfo } from "@/lib/type";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;

    const session = await getSessionData();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: {
          select: { following: true },
        },
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const data: FollowingInfo = {
      followingCount: user._count.following,
    };

    return Response.json(data);
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
