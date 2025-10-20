import { getSessionData } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CommentData, CommentsPage, getCommentDataInclude } from "@/lib/type";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const session = await getSessionData();
  const { postId } = await params;

  const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
  const initialCommentId =
    req.nextUrl.searchParams.get("targetCommentId") || undefined;
  const pageSize = 10;
  const userId = session?.user.id;

  try {
    let initialComment = null;
    const loadedComments: CommentData[] = [];

    if (initialCommentId && !cursor) {
      initialComment = await prisma.comment.findUnique({
        where: {
          id: initialCommentId,
          postId,
          parentCommentId: null,
        },
        include: getCommentDataInclude(userId),
      });

      if (initialComment) {
        loadedComments.push(initialComment);
      }
    }

    const fetchCount = pageSize + 1 - loadedComments.length;

    const otherComments = await prisma.comment.findMany({
      where: {
        postId,
        parentCommentId: null,
        id: initialCommentId ? { not: initialCommentId } : undefined,
      },
      include: getCommentDataInclude(userId),
      orderBy: { createdAt: "asc" },
      take: fetchCount,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const allComments = [...loadedComments, ...otherComments];

    const nextCursor =
      allComments.length > pageSize ? allComments[pageSize].id : null;

    const data: CommentsPage = {
      comments: allComments.slice(0, pageSize),
      nextCursor,
      prevCursor: null,
    };

    return Response.json(data);
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
