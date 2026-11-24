"use client";
import React, { useMemo, useState } from "react";
import { Plate } from "@/features/ui/plate";
import { TabButton } from "../ui/tab-button";
import Link from "next/link";
import { ChevronLeft, CrownIcon } from "lucide-react";

interface TeamRankItem {
  id: number;
  name: string;
  points: number;
  steps: number;
}

interface UserRankItem {
  id: number;
  name: string;
  points: number;
  steps: number;
}

export function ReportHome({
  teams,
  users,
  event,
  isTeamRankVisible,
  isUserRankVisible,
}: {
  // Add any props you need for the component here
  teams: TeamRankItem[];
  users: UserRankItem[];
  event: {
    name: string;
  };
  isTeamRankVisible: boolean;
  isUserRankVisible: boolean;
}) {
  // Add your component logic here

  // Sort the teams based on their points in descending order
  const [sortByPoints, setSortByPoints] = useState(true);

  const sortedTeams = useMemo(
    () =>
      teams.sort((a, b) => {
        if (sortByPoints) {
          return b.points - a.points;
        } else {
          return b.steps - a.steps;
        }
      }),
    [sortByPoints, teams]
  );

  const sortedUsers = useMemo(
    () =>
      users.sort((a, b) => {
        if (sortByPoints) {
          return b.points - a.points;
        } else {
          return b.steps - a.steps;
        }
      }),
    [sortByPoints, users]
  );

  return (
    <div className="container py-8 flex flex-col space-y-3 bg-slate-100">
      <div>
        <Link
          href="javascript:history.back()"
          className="flex items-center text-blue-500 text-sm leading-none"
        >
          <ChevronLeft className="w-4 h-4"></ChevronLeft>
          <span>戻る</span>
        </Link>
        <h2 className="font-bold text-lg">「{event.name}」ランキング</h2>
      </div>
      <TabButton
        buttons={[
          {
            label: "ポイント",
            onClick: () => setSortByPoints(true),
            defaultIsActive: sortByPoints,
          },
          {
            label: "歩数",
            onClick: () => setSortByPoints(false),
            defaultIsActive: !sortByPoints,
          },
        ]}
      ></TabButton>
      {isTeamRankVisible && (
        <Plate>
          <h2 className=" flex space-x-1 items-center text-slate-700">
            <CrownIcon></CrownIcon>
            <span className="font-bold">チームランキング</span>
          </h2>
          <ul className="flex flex-col space-y-1">
            {sortedTeams.map((team, index) => (
              <ListItem
                key={team.name}
                index={index}
                item={team}
                sortByPoints={sortByPoints}
              ></ListItem>
            ))}
          </ul>
        </Plate>
      )}
      {isUserRankVisible && (
        <Plate>
          <h2 className=" flex space-x-1 items-center text-slate-700">
            <CrownIcon></CrownIcon>
            <span className="font-bold">個人ランキング</span>
          </h2>
          <ul className="flex flex-col space-y-1">
            {sortedUsers.map((user, index) => (
              <ListItem
                key={user.name}
                index={index}
                item={user}
                sortByPoints={sortByPoints}
              ></ListItem>
            ))}
          </ul>
        </Plate>
      )}
    </div>
  );
}

function ListItem({
  item,
  index,
  sortByPoints,
}: {
  item: {
    id: number;
    name: string;
    points: number;
    steps: number;
  };
  index: number;
  sortByPoints: boolean;
}) {
  return (
    <li
      key={item.id}
      className="grid grid-cols-[max-content,200px,auto] items-baseline gap-3"
    >
      <span className="text-gray-500 text-sm">{index + 1}</span>
      <span className="text-gray-700 text-lg font-bold">{item.name}</span>
      <div className="flex items-baseline text-gray-500 space-x-2">
        <span className="flex items-baseline text-gray-500 ">
          <span className=" text-lg">
            {sortByPoints ? item.points : item.steps}
          </span>
          <span className=" text-xs ont-medium">
            {sortByPoints ? "pt" : "歩"}
          </span>
        </span>
        <span>
          (<span className="">{sortByPoints ? item.steps : item.points}</span>
          <span className="">{sortByPoints ? "歩" : "pt"}</span>)
        </span>
      </div>
    </li>
  );
}
