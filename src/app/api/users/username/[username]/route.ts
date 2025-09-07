import { getSessionData } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/type";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const session = await getSessionData();
    const { username } = await params;

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
      select: getUserDataSelect(session.user.id),
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
