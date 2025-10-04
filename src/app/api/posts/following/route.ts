import { prisma } from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/type";
import { NextRequest } from "next/server";
import { getSessionData } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionData();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
  const pageSize = 10;

  try {
    const posts = await prisma.post.findMany({
      where: {
        user: {
          followers: {
            some: {
              followerId: session.user.id,
            },
          },
        },
      },
      include: getPostDataInclude(session.user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
