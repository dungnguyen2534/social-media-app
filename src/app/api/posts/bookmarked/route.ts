import { prisma } from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/type";
import { NextRequest } from "next/server";
import { getSessionData } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionData();
  const userId = session?.user.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
  const pageSize = 10;

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
      },
      include: {
        post: {
          include: getPostDataInclude(userId),
        },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor =
      bookmarks.length > pageSize ? bookmarks[pageSize].id : null;

    const data: PostsPage = {
      posts: bookmarks.slice(0, pageSize).map((bookmark) => bookmark.post),
      nextCursor,
    };

    return Response.json(data);
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
