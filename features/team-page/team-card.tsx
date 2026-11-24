"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import useSWR from "swr";
import { Button } from "../ui/button";

const fetcher = (...args: [RequestInfo, RequestInit?]) =>
  fetch(...args).then((res) => res.json());

export function TeamCard({
  team,
}: {
  team: {
    id: number;
    name: string;
  };
}) {
  const [isShowUsers, setIsShowUsers] = useState(false);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-slate-600">{team.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-3">
        <Button variant="outline" onClick={() => setIsShowUsers(true)}>
          所属メンバー表示
        </Button>
        {isShowUsers && <TeamUser team={team} />}
      </CardContent>
    </Card>
  );
}

function TeamUser({ team }: { team: { id: number; name: string } }) {
  const {
    data: users,
    error,
    isLoading,
  } = useSWR<
    {
      user_id: number;
      user_name: string;
    }[]
  >(`/api/team-users?teamId=${team.id}`, fetcher);

  if (error) return <div>データを取得できませんでした...</div>;
  if (isLoading) return <div>loading...</div>;

  return (
    <div className="p-4 border rounded-lg bg-gray-50 flex flex-col space-y-3">
      {users &&
        users.map((user) => (
          <div key={user.user_id} className={"px-1 border bg-white"}>
            <span>{user.user_name}</span>
          </div>
        ))}
    </div>
  );
}
