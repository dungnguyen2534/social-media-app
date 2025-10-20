import { getSessionData } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CommentsPage, getCommentDataInclude } from "@/lib/type";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  const session = await getSessionData();
  const { commentId } = await params;

  const cursor = req.nextUrl.searchParams.get("cursor") || null;
  const direction = req.nextUrl.searchParams.get("direction") || "next";
  const pageSize = 6;

  const isNext = direction === "next";

  try {
    const comments = await prisma.comment.findMany({
      where: {
        parentCommentId: commentId,
      },
      include: getCommentDataInclude(session?.user.id),
      orderBy: { createdAt: isNext ? "asc" : "desc" },
      take: pageSize + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    let data: CommentsPage;

    if (isNext) {
      const hasMore = comments.length > pageSize;
      const items = comments.slice(0, pageSize);

      data = {
        comments: items,
        nextCursor: hasMore ? items[pageSize - 1].id : null,
        prevCursor: cursor,
      };
    } else {
      const hasPrevious = comments.length > pageSize;
      const items = comments.slice(0, pageSize);
      const commentsToSend = [...items].reverse();

      data = {
        comments: commentsToSend,
        nextCursor: cursor,
        prevCursor: hasPrevious ? commentsToSend[0].id : null,
      };
    }

    return Response.json(data);
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
