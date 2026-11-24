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
import { EditUserModal } from "./edit-user-modal";
import { EditUserPasswordModal } from "./edit-user-password-modal";
import { DeleteUserModal } from "./delete-user-modal";
import { ArchiveIcon, ArchiveRestoreIcon } from "lucide-react";
import { ConfirmActionButton } from "../ui/confirm-action-button";
// アーカイブと復元は、この表でしか使わないのでサーバーの処理を直接呼ぶ
import { archiveUser, restoreUser } from "./user-service";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";

// ユーザーデータ型
type User = {
  user_id: string | null;
  user_name: string | null;
  is_admin: boolean | null;
  team_id: number | null;
  team_name: string | null;
};

export function UserTable({
  users,
  updateUser,
  updateUserPassword,
  deleteUser,
  getUserRecordCount,
  currentUserId,
  isArchivedView = false,
  teams,
}: {
  users: User[];
  updateUser: (data: {
    userId: string;
    teamId: number | null;
    name: string;
    password?: string;
    isAdmin: boolean;
  }) => Promise<any>;
  updateUserPassword: (data: {
    userId: string;
    password: string;
  }) => Promise<any>;
  deleteUser: (userId: string) => Promise<{ failure: string } | void>;
  getUserRecordCount: (userId: string) => Promise<number>;
  currentUserId: string;
  // true のときはアーカイブ中のユーザーの一覧として表示する
  isArchivedView?: boolean;
  teams: {
    id: number;
    name: string;
  }[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // テーブルのカラム定義
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "user_name",
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
      accessorKey: "team_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            size="xs"
            className="p-0"
          >
            所属チーム
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <span>{row.original.team_name ?? "所属なし"}</span>,
    },
    {
      accessorKey: "is_admin",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            size="xs"
            className="p-0"
          >
            管理者
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <span>{row.original.is_admin ? "管理者" : "一般"}</span>
      ),
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
              title={`${row.original.user_name ?? ""}を元に戻しますか？`}
              description="利用中の一覧に戻り、再びログインできるようになります。"
              confirmLabel="元に戻す"
              successMessage={`${row.original.user_name ?? ""}を元に戻しました`}
              onConfirm={() => restoreUser(row.original.user_id ?? "")}
            ></ConfirmActionButton>
          ) : (
            <>
              <EditUserModal
                teams={teams}
                updateUser={updateUser}
                user={{
                  userId: row.original.user_id ?? "",
                  name: row.original.user_name ?? "",
                  teamId: row.original.team_id,
                  isAdmin: row.original.is_admin ?? false,
                }}
              ></EditUserModal>
              <EditUserPasswordModal
                user={{
                  userId: row.original.user_id ?? "",
                  name: row.original.user_name ?? "",
                }}
                updateUserPassword={updateUserPassword}
              ></EditUserPasswordModal>
              <ConfirmActionButton
                label="アーカイブ"
                icon={<ArchiveIcon className="h-4 w-4 mr-1" />}
                title={`${row.original.user_name ?? ""}をアーカイブしますか？`}
                description="ログインできなくなり、一覧やこれから公開するイベントの参加者から外れます。これまでの記録は残り、いつでも元に戻せます。"
                confirmLabel="アーカイブする"
                successMessage={`${row.original.user_name ?? ""}をアーカイブしました`}
                onConfirm={() => archiveUser(row.original.user_id ?? "")}
                disabledReason={
                  row.original.user_id === currentUserId
                    ? "ログイン中の自分自身はアーカイブできません"
                    : undefined
                }
              ></ConfirmActionButton>
            </>
          )}
          <DeleteUserModal
            user={{
              userId: row.original.user_id ?? "",
              name: row.original.user_name ?? "",
            }}
            deleteUser={deleteUser}
            getUserRecordCount={getUserRecordCount}
            disabledReason={
              row.original.user_id === currentUserId
                ? "ログイン中の自分自身は削除できません"
                : undefined
            }
          ></DeleteUserModal>
        </div>
      ),
    },
  ];

  // テーブルのフック
  const table = useReactTable({
    data: users,
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
