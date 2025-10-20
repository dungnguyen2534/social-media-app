import { getSessionData } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CommentsPage, getCommentDataInclude } from "@/lib/type";
import { NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ commentId: string; replyId: string }> },
) {
  const session = await getSessionData();
  const { commentId, replyId } = await params;

  try {
    const reply = await prisma.comment.findUnique({
      where: {
        id: replyId,
        parentCommentId: commentId,
      },
      include: getCommentDataInclude(session?.user.id),
    });

    if (!reply) {
      return Response.json({ error: "Reply not found" }, { status: 404 });
    }

    const prevReply = await prisma.comment.findFirst({
      where: {
        parentCommentId: commentId,
        createdAt: {
          lt: reply.createdAt,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const nextReply = await prisma.comment.findFirst({
      where: {
        parentCommentId: commentId,
        createdAt: {
          gt: reply.createdAt,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const data: CommentsPage = {
      comments: [reply],
      prevCursor: prevReply ? reply.id : null,
      nextCursor: nextReply ? reply.id : null,
    };

    return Response.json(data);
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
