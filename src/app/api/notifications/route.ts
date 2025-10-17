import { prisma } from "@/lib/prisma";
import { getNotificationDataInclude, NotificationsPage } from "@/lib/type";
import { NextRequest } from "next/server";
import { getSessionData } from "@/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionData();
  const signedInUserId = session?.user.id;

  if (!signedInUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
  const pageSize = 10;

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: signedInUserId,
      },
      include: getNotificationDataInclude(),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const nextCursor =
      notifications.length > pageSize ? notifications[pageSize].id : null;

    const data: NotificationsPage = {
      notifications: notifications.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
