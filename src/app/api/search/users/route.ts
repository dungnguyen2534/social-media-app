import { getSessionData } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserDataSelect, UsersPage } from "@/lib/type";
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
    const data: UsersPage = { users: [], nextCursor: null };
    return Response.json(data);
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              search: searchQuery,
            },
          },
          {
            name: {
              search: searchQuery,
            },
          },
        ],
      },
      orderBy: {
        followers: {
          _count: "desc",
        },
      },
      select: getUserDataSelect(signedInUserId),
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = users.length > pageSize ? users[pageSize].id : null;

    const data: UsersPage = {
      users: users.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
