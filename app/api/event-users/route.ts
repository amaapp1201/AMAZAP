import { getEventUsers } from "@/features/user-page/user-service";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamId = searchParams.get("teamId");
  const eventId = searchParams.get("eventId");

  if (teamId === null || eventId === null) {
    return new Response("teamId or eventId is required", { status: 400 });
  }

  const users = await getEventUsers({
    eventId: Number(eventId),
    teamId: Number(teamId),
  });

  return new Response(JSON.stringify(users), {
    headers: {
      "content-type": "application/json",
    },
  });
}
