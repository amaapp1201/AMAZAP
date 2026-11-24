"use client";

import { ArchiveIcon, ArchiveRestoreIcon, TrashIcon } from "lucide-react";
import { ReactNode, useState } from "react";

import { Button } from "../ui/button";
import { ConfirmActionButton } from "../ui/confirm-action-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
// アーカイブ・復元・削除は、この画面でしか使わないのでサーバーの処理を直接呼ぶ
import { archiveAction, deleteAction, restoreAction } from "./action-service";
import {
  archiveCategory,
  deleteCategory,
  restoreCategory,
} from "./category-service";

const ACTION_DELETE_DESCRIPTION =
  "一度削除すると元に戻すことはできません。公開済みのイベントで使われたアクションは削除できません。";
const CATEGORY_DELETE_DESCRIPTION =
  "カテゴリの中のアクションもすべて削除されます。一度削除すると元に戻すことはできません。公開済みのイベントで使われたカテゴリは削除できません。";

// アクションの「…」メニューの中身。編集ボタン（children）の下に、アーカイブと削除を並べる
export function ActionMenu({
  action,
  children,
}: {
  action: { id: number; name: string };
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-1">
      {children}
      <ConfirmActionButton
        label="アーカイブ"
        icon={<ArchiveIcon className="h-4 w-4 mr-1" />}
        title={`「${action.name}」をアーカイブしますか？`}
        description="一覧に出なくなり、これから公開するイベントにも入らなくなります。公開済みのイベントの記録は残り、いつでも元に戻せます。"
        confirmLabel="アーカイブする"
        successMessage={`「${action.name}」をアーカイブしました`}
        onConfirm={() => archiveAction(action.id)}
      ></ConfirmActionButton>
      <ConfirmActionButton
        label="削除"
        variant="destructive"
        icon={<TrashIcon className="h-4 w-4 mr-1" />}
        title={`「${action.name}」を削除しますか？`}
        description={ACTION_DELETE_DESCRIPTION}
        confirmLabel="削除する"
        successMessage={`「${action.name}」を削除しました`}
        onConfirm={() => deleteAction(action.id)}
      ></ConfirmActionButton>
    </div>
  );
}

// カテゴリの「…」メニューの中身
export function CategoryMenu({
  category,
  children,
}: {
  category: { id: number; name: string };
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-1">
      {children}
      <ConfirmActionButton
        label="アーカイブ"
        icon={<ArchiveIcon className="h-4 w-4 mr-1" />}
        title={`カテゴリ「${category.name}」をアーカイブしますか？`}
        description="中のアクションごと一覧や選択肢に出なくなり、計画中のイベントの対象からも外れます。公開済みのイベントの記録は残り、いつでも元に戻せます。"
        confirmLabel="アーカイブする"
        successMessage={`カテゴリ「${category.name}」をアーカイブしました`}
        onConfirm={() => archiveCategory(category.id)}
      ></ConfirmActionButton>
      <ConfirmActionButton
        label="削除"
        variant="destructive"
        icon={<TrashIcon className="h-4 w-4 mr-1" />}
        title={`カテゴリ「${category.name}」を削除しますか？`}
        description={CATEGORY_DELETE_DESCRIPTION}
        confirmLabel="削除する"
        successMessage={`カテゴリ「${category.name}」を削除しました`}
        onConfirm={() => deleteCategory(category.id)}
      ></ConfirmActionButton>
    </div>
  );
}

// アーカイブ中のカテゴリとアクションを一覧し、元に戻す・削除するための画面
export function ArchiveListModal({
  archivedCategories,
  archivedActions,
  disabled = false,
}: {
  archivedCategories: { id: number; name: string }[];
  archivedActions: {
    id: number;
    name: string;
    point: number;
    categoryName: string;
  }[];
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const count = archivedCategories.length + archivedActions.length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <ArchiveIcon className="h-4 w-4 mr-1"></ArchiveIcon>
          アーカイブ一覧（{count}）
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[85vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>アーカイブ一覧</DialogTitle>
          <DialogDescription>
            アーカイブしたカテゴリとアクションです。「元に戻す」で再び使えるようになります。
          </DialogDescription>
        </DialogHeader>
        <section className="flex flex-col space-y-2">
          <h3 className="font-bold text-sm">カテゴリ</h3>
          {archivedCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              アーカイブ中のカテゴリはありません
            </p>
          ) : (
            archivedCategories.map((category) => (
              <ArchiveRow key={category.id} name={category.name}>
                <ConfirmActionButton
                  label="元に戻す"
                  className="h-8"
                  icon={<ArchiveRestoreIcon className="h-4 w-4 mr-1" />}
                  title={`カテゴリ「${category.name}」を元に戻しますか？`}
                  description="中のアクションと一緒に一覧へ戻り、イベントの対象として再び選べるようになります。"
                  confirmLabel="元に戻す"
                  successMessage={`カテゴリ「${category.name}」を元に戻しました`}
                  onConfirm={() => restoreCategory(category.id)}
                ></ConfirmActionButton>
                <ConfirmActionButton
                  label="削除"
                  className="h-8"
                  variant="destructive"
                  icon={<TrashIcon className="h-4 w-4 mr-1" />}
                  title={`カテゴリ「${category.name}」を削除しますか？`}
                  description={CATEGORY_DELETE_DESCRIPTION}
                  confirmLabel="削除する"
                  successMessage={`カテゴリ「${category.name}」を削除しました`}
                  onConfirm={() => deleteCategory(category.id)}
                ></ConfirmActionButton>
              </ArchiveRow>
            ))
          )}
        </section>
        <section className="flex flex-col space-y-2">
          <h3 className="font-bold text-sm">アクション</h3>
          {archivedActions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              アーカイブ中のアクションはありません
            </p>
          ) : (
            archivedActions.map((action) => (
              <ArchiveRow
                key={action.id}
                name={action.name}
                note={`${action.categoryName}・${action.point}pt`}
              >
                <ConfirmActionButton
                  label="元に戻す"
                  className="h-8"
                  icon={<ArchiveRestoreIcon className="h-4 w-4 mr-1" />}
                  title={`「${action.name}」を元に戻しますか？`}
                  description={`カテゴリ「${action.categoryName}」の一覧に戻り、これから公開するイベントに入るようになります。`}
                  confirmLabel="元に戻す"
                  successMessage={`「${action.name}」を元に戻しました`}
                  onConfirm={() => restoreAction(action.id)}
                ></ConfirmActionButton>
                <ConfirmActionButton
                  label="削除"
                  className="h-8"
                  variant="destructive"
                  icon={<TrashIcon className="h-4 w-4 mr-1" />}
                  title={`「${action.name}」を削除しますか？`}
                  description={ACTION_DELETE_DESCRIPTION}
                  confirmLabel="削除する"
                  successMessage={`「${action.name}」を削除しました`}
                  onConfirm={() => deleteAction(action.id)}
                ></ConfirmActionButton>
              </ArchiveRow>
            ))
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
}

function ArchiveRow({
  name,
  note,
  children,
}: {
  name: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_max-content] gap-2 items-center border rounded-md px-3 py-2">
      <div className="min-w-0">
        <div className="break-words">{name}</div>
        {note && <div className="text-xs text-muted-foreground">{note}</div>}
      </div>
      <div className="flex space-x-2">{children}</div>
    </div>
  );
}
