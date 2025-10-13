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

  const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
  const pageSize = 6;

  try {
    const comments = await prisma.comment.findMany({
      where: {
        parentCommentId: commentId,
      },
      include: getCommentDataInclude(session?.user.id),
      orderBy: { createdAt: "asc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor =
      comments.length > pageSize ? comments[pageSize].id : null;

    const data: CommentsPage = {
      comments: comments.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
