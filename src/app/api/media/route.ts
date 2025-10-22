import { getSessionData } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getSessionData();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const idsString = searchParams.get("ids");
  if (!idsString) {
    return NextResponse.json(
      { error: "Missing 'ids' parameter" },
      { status: 400 },
    );
  }

  const ids = idsString.split(",").filter((id) => id.trim() !== "");

  try {
    const mediaItems = await prisma.media.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json(mediaItems);
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
