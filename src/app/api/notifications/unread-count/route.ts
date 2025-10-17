import { getSessionData } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NotificationCountInfo } from "@/lib/type";

export async function GET() {
  const session = await getSessionData();
  const signedInUserId = session?.user.id;

  if (!signedInUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const unreadCount = await prisma.notification.count({
      where: {
        recipientId: signedInUserId,
        read: false,
      },
    });

    const data: NotificationCountInfo = {
      unreadCount,
    };

    return Response.json(data);
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
