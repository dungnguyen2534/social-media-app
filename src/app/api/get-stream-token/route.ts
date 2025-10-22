import { getSessionData } from "@/auth";
import streamSeverClient from "@/lib/stream";

export async function GET() {
  const session = await getSessionData();
  const signedInUser = session?.user;
  if (!signedInUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
    const issuedAt = Math.floor(Date.now() / 1000) - 60;

    const token = streamSeverClient.createToken(
      signedInUser.id!,
      expirationTime,
      issuedAt,
    );

    return Response.json({ token });
  } catch (err) {
    console.log(err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
