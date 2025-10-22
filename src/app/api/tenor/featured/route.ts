import { NextRequest } from "next/server";
import ky, { HTTPError } from "ky";
import { getSessionData } from "@/auth";
import { env } from "@/env";

const TENOR_API_KEY = env.TENOR_API_KEY;
const BASE_TENOR_SEARCH_URL = "https://tenor.googleapis.com/v2/featured";

export async function GET(req: NextRequest) {
  const session = await getSessionData();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = req.nextUrl.searchParams.get("limit") || "10";

  if (!TENOR_API_KEY) {
    console.error(
      "TENOR_API_KEY is not defined in environment variables. Check .env.local",
    );
    return Response.json(
      { error: "Server configuration error" },
      { status: 500 },
    );
  }

  try {
    const externalUrl = `${BASE_TENOR_SEARCH_URL}?&key=${TENOR_API_KEY}&limit=${limit}`;
    const data = await ky.get(externalUrl).json();

    return Response.json(data);
  } catch (err) {
    if (err instanceof HTTPError) {
      const status = err.response.status;
      const statusText = err.response.statusText || "Unknown Status";

      console.error(`Tenor API Error: ${status} - ${statusText}`);
      return Response.json({ error: "External API failure" }, { status });
    }

    console.error("Internal Server Error during Tenor fetch:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
