"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/features/ui/table";

import {
  useReactTable,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { EditTeamModal } from "./edit-team-modal";
import { TeamMemberModal } from "./team-member-modal";
import { useState } from "react";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";

// ユーザーデータ型
type Team = {
  id: number;
  name: string;
};

export function TeamTable({
  updateTeam,
  teams,
}: {
  updateTeam: (data: { teamId: number; name: string }) => Promise<any>;
  teams: {
    id: number;
    name: string;
  }[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // テーブルのカラム定義
  const columns: ColumnDef<Team>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            size="xs"
            className="p-0"
          >
            名前
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        );
      },
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <EditTeamModal
            updateTeam={updateTeam}
            team={{
              name: row.original.name,
              teamId: row.original.id,
            }}
          ></EditTeamModal>
          <TeamMemberModal teamId={row.original.id}></TeamMemberModal>
        </div>
      ),
    },
  ];

  // テーブルのフック
  const table = useReactTable({
    data: teams,
    columns,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <Table className="bg-white rounded-md">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className="px-4 py-1 h-6">
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className="px-4 py-1">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
