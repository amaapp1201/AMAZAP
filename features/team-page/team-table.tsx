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
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  ArrowUpDown,
  TrashIcon,
} from "lucide-react";
import { ConfirmActionButton } from "../ui/confirm-action-button";
// アーカイブ・復元・削除は、この表でしか使わないのでサーバーの処理を直接呼ぶ
import { archiveTeam, deleteTeam, restoreTeam } from "./team-service";

// ユーザーデータ型
type Team = {
  id: number;
  name: string;
};

export function TeamTable({
  updateTeam,
  teams,
  isArchivedView = false,
}: {
  updateTeam: (data: { teamId: number; name: string }) => Promise<any>;
  // true のときはアーカイブ中のチームの一覧として表示する
  isArchivedView?: boolean;
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
          {isArchivedView ? (
            <ConfirmActionButton
              label="元に戻す"
              icon={<ArchiveRestoreIcon className="h-4 w-4 mr-1" />}
              title={`${row.original.name}を元に戻しますか？`}
              description="利用中の一覧に戻り、ユーザーの所属先やイベントの対象として再び選べるようになります。"
              confirmLabel="元に戻す"
              successMessage={`${row.original.name}を元に戻しました`}
              onConfirm={() => restoreTeam(row.original.id)}
            ></ConfirmActionButton>
          ) : (
            <>
              <EditTeamModal
                updateTeam={updateTeam}
                team={{
                  name: row.original.name,
                  teamId: row.original.id,
                }}
              ></EditTeamModal>
              <TeamMemberModal teamId={row.original.id}></TeamMemberModal>
              <ConfirmActionButton
                label="アーカイブ"
                icon={<ArchiveIcon className="h-4 w-4 mr-1" />}
                title={`${row.original.name}をアーカイブしますか？`}
                description="一覧や選択肢に出なくなり、計画中のイベントの対象からも外れます。公開済みのイベントの記録や集計は残り、いつでも元に戻せます。"
                confirmLabel="アーカイブする"
                successMessage={`${row.original.name}をアーカイブしました`}
                onConfirm={() => archiveTeam(row.original.id)}
              ></ConfirmActionButton>
            </>
          )}
          <ConfirmActionButton
            label="削除"
            variant="destructive"
            icon={<TrashIcon className="h-4 w-4 mr-1" />}
            title={`${row.original.name}を削除しますか？`}
            description="所属しているユーザーは「所属なし」になります。一度削除すると元に戻すことはできません。公開済みのイベントで使われたチームは削除できません。"
            confirmLabel="削除する"
            successMessage={`${row.original.name}を削除しました`}
            onConfirm={() => deleteTeam(row.original.id)}
          ></ConfirmActionButton>
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
