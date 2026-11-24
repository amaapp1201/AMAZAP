import Link from "next/link";
import useSWR from "swr";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { LockIcon } from "lucide-react";

const fetcher = (...args: [RequestInfo, RequestInit?]) =>
  fetch(...args).then((res) => res.json());

export function TeamUser({
  teamName,
  teamId,
  eventId,
  isLocked = false,
}: {
  teamName?: string;
  teamId: number;
  eventId?: number;
  isLocked?: boolean;
}) {
  const searchUrl = eventId
    ? `/api/event-users?eventId=${eventId}&teamId=${teamId}`
    : `/api/team-users?teamId=${teamId}`;
  const {
    data: users,
    error,
    isLoading,
  } = useSWR<
    {
      user_id: number;
      user_name: string;
    }[]
  >(searchUrl, fetcher);

  if (error) return <div>データを取得できませんでした...</div>;
  if (isLoading) return <div>loading...</div>;

  return (
    <div className="p-4 border rounded-lg bg-gray-50 flex flex-col space-y-3">
      {teamName && (
        <Link
          className="hover:text-blue-500 text-gray-700 hover:underline"
          href={`/admin/users?searchTerm=${encodeURIComponent(teamName)}`}
        >
          <div className="font-medium  leading-none">
            {isLocked && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <LockIcon className="mr-1 h-4 w-4 stroke-slate-500"></LockIcon>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>公開後チームは編集できません</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {teamName}
          </div>
        </Link>
      )}
      {users &&
        users.map((user) => (
          <Link
            className="hover:text-blue-500 hover:underline"
            href={`/admin/users?searchTerm=${encodeURIComponent(
              user.user_name
            )}`}
            key={user.user_id}
          >
            <div className={"px-1 border bg-white"}>{user.user_name}</div>
          </Link>
        ))}
      {users?.length === 0 && <div>所属メンバーがいません</div>}
    </div>
  );
}
