import { getSessionData } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH() {
  const session = await getSessionData();
  const signedInUserId = session?.user.id;

  if (!signedInUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.notification.updateMany({
      where: {
        recipientId: signedInUserId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return new Response();
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
