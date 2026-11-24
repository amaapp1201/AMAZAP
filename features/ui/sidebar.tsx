"use client";

import {
  BarChart3,
  CalendarHeart,
  Dumbbell,
  Link2,
  User,
  Users,
} from "lucide-react";
import { Route } from "next";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { cn } from "@/features/helpers/utils";

export function Sidebar() {
  const segment = useSelectedLayoutSegment();

  return (
    <div className="w-full h-full flex py-3 px-1 flex-col items-center ">
      <ul className="flex flex-col space-y-1">
        <MenuItem
          Icon={
            <CalendarHeart className="h-5 w-5 mr-3 group-hover:text-white" />
          }
          href="/admin/events/current"
          label="イベント"
          isCurrent={segment === "events"}
        ></MenuItem>
        <MenuItem
          Icon={<Dumbbell className="h-5 w-5 mr-3 group-hover:text-white" />}
          href="/admin/actions"
          label="アクション"
          isCurrent={segment === "actions"}
        ></MenuItem>
        <MenuItem
          Icon={<User className="h-5 w-5 mr-3 group-hover:text-white" />}
          href="/admin/users"
          label="ユーザー"
          isCurrent={segment === "users"}
        ></MenuItem>
        <MenuItem
          Icon={<Users className="h-5 w-5 mr-3 group-hover:text-white" />}
          href="/admin/teams"
          label="チーム"
          isCurrent={segment === "teams"}
        ></MenuItem>
        <MenuItem
          Icon={<BarChart3 className="h-5 w-5 mr-3 group-hover:text-white" />}
          href="/admin/analytics"
          label="分析"
          isCurrent={segment === "analytics"}
        ></MenuItem>
      </ul>
    </div>
  );
}

function MenuItem({
  Icon,
  label,
  href,
  isCurrent = false,
}: {
  Icon: React.ReactNode;
  label: string;
  href: Route;
  isCurrent?: boolean;
}) {
  return (
    <li
      className={cn(
        "group text-neutral-600 dark:text-neutral-400 hover:bg-primary rounded-sm p-1 cursor-pointer",
        isCurrent && "bg-primary text-white"
      )}
    >
      <Link href={href} className="flex items-center">
        {Icon}

        <span className="group-hover:text-white">{label}</span>
      </Link>
    </li>
  );
}
