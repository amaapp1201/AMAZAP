import { getTeamUsers } from "@/features/user-page/user-service";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamId = searchParams.get("teamId");

  if (teamId === null) {
    return new Response("teamId  is required", { status: 400 });
  }

  const users = await getTeamUsers(Number(teamId));

  return new Response(JSON.stringify(users), {
    headers: {
      "content-type": "application/json",
    },
  });
}
