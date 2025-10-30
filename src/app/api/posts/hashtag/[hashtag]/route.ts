import { prisma } from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/type";
import { NextRequest } from "next/server";
import { getSessionData } from "@/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ hashtag: string }> },
) {
  const session = await getSessionData();
  const { hashtag } = await params;

  const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
  const pageSize = 10;

  const tagWithHash = `#${hashtag}`;

  try {
    const posts = await prisma.post.findMany({
      where: {
        content: {
          contains: tagWithHash,
        },
      },
      include: getPostDataInclude(session?.user.id),
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
