import { getSessionData } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/type";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getSessionData();
  const signedInUserId = session?.user.id;

  if (!signedInUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q") || "";
  const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
  const pageSize = 10;

  const searchQuery = q
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word}:*`)
    .join(" & ");

  if (!searchQuery) {
    const data: PostsPage = { posts: [], nextCursor: null };
    return Response.json(data);
  }

  try {
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            content: {
              search: searchQuery,
            },
          },
          {
            user: {
              name: {
                search: searchQuery,
              },
            },
          },
          {
            user: {
              username: {
                search: searchQuery,
              },
            },
          },
        ],
      },
      include: getPostDataInclude(signedInUserId),
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
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
