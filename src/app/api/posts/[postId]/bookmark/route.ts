import { getSessionData } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BookmarkInfo } from "@/lib/type";
import { NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const session = await getSessionData();
  const userId = session?.user.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await params;

  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!bookmark) {
      return Response.json({ error: "bookmark not found" }, { status: 404 });
    }

    const data: BookmarkInfo = {
      isBookmarkedByUser: !!bookmark,
    };

    return Response.json(data);
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  _: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const session = await getSessionData();
  const userId = session?.user.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await params;

  try {
    await prisma.bookmark.upsert({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
      create: {
        userId,
        postId,
      },
      update: {},
    });

    return new Response();
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ postId: string }> },
) {
  const session = await getSessionData();
  const userId = session?.user.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await params;

  try {
    await prisma.bookmark.deleteMany({
      where: {
        userId,
        postId,
      },
    });

    return new Response();
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
