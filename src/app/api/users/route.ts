import { prisma } from "@/lib/prisma";
import { getUserDataSelect, UsersPage } from "@/lib/type";
import { NextRequest } from "next/server";
import { getSessionData } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionData();
  const signedInUserId = session?.user.id;

  const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
  const pageSize = 10;

  try {
    const users = await prisma.user.findMany({
      where: signedInUserId
        ? {
            id: {
              not: signedInUserId,
            },
          }
        : undefined,
      select: getUserDataSelect(signedInUserId),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor = users.length > pageSize ? users[pageSize].id : null;

    const data: UsersPage = {
      users: users.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
