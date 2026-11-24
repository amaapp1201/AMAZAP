"use client";

import { UniqueIdentifier } from "@dnd-kit/core";
import { Column } from "../ui/kanban/board-column";
import { KanbanBoard } from "../ui/kanban/kanban-board";
import { Task } from "../ui/kanban/task-card";
import { Action } from "../ui/action";
import { NewActionModal } from "./new-action-modal";
import { NewCategoryModal } from "./new-category-modal";
import { EditActionModal } from "./edit-action-modal";
import { EditCategoryModal } from "./edit-category-modal";
import { useCallback, useContext, useMemo, useState } from "react";
import { LocalShcmeaType } from "./category-form";
import { ActionSaveButton } from "./action-save";
import {
  KanbanBoardContext,
  KanbanBoardProvider,
} from "../ui/kanban/kanban-context";
import { toast } from "sonner";
import { ActionMenu, ArchiveListModal, CategoryMenu } from "./action-archive";

export function ActionHome({
  categories,
  createNewAction,
  updateAction,
  updateCategory,
  actions,
  updateCategoryOrders,
  updateActionOrders,
  createNewCategory,
  archivedCategories,
  archivedActions,
}: {
  categories: {
    id: number;
    name: string;
    order_id: number;
    isSingleSelection: boolean;
  }[];
  archivedCategories: { id: number; name: string }[];
  archivedActions: {
    id: number;
    name: string;
    point: number;
    categoryName: string;
  }[];
  actions: {
    category_id: number;
    id: number;
    name: string;
    point: number;
    order_id: number;
  }[];
  createNewAction: (data: {
    name: string;
    point: number;
    category_id: number;
  }) => Promise<void>;
  updateAction: (data: {
    id: number;
    name: string;
    point: number;
    category_id: number;
  }) => Promise<void>;
  updateCategory: (data: {
    id: number;
    name: string;
    isSingleSelection: boolean;
  }) => Promise<void>;
  updateCategoryOrders: (
    data: { id: number; order_id: number }[]
  ) => Promise<void>;
  updateActionOrders: (
    data: { category_id: number; id: number; order_id: number }[]
  ) => Promise<void>;
  createNewCategory: (data: LocalShcmeaType) => Promise<void>;
}) {
  const columns: Column[] = useMemo(
    () =>
      categories.map((category) => ({
        id: category.id,
        title:
          category.name + (category.isSingleSelection ? " (単一選択)" : ""),
      })),
    [categories]
  );

  const tasks: Task[] = useMemo(
    () =>
      actions.map((action) => ({
        id: action.id as UniqueIdentifier,
        columnId: action.category_id as UniqueIdentifier,
        content: (
          <Action
            action={{
              id: action.id,
              name: action.name,
              point: action.point,
            }}
          ></Action>
        ),
      })),
    [actions]
  );

  const onUpdateColumns = async (
    columns: {
      columnId: UniqueIdentifier;
      order: number;
    }[]
  ) => {
    return updateCategoryOrders(
      columns.map((c) => ({
        id: Number(c.columnId),
        order_id: c.order,
      }))
    );
  };

  const updateTaskOrders = async (
    tasks: {
      taskId: UniqueIdentifier;
      columnId: UniqueIdentifier;
      order: number;
    }[]
  ) => {
    return updateActionOrders(
      tasks.map((t) => ({
        category_id: Number(t.columnId),
        id: Number(t.taskId),
        order_id: t.order,
      }))
    );
  };

  return (
    <KanbanBoardProvider>
      <div className="flex flex-col space-y-3 px-4 py-4">
        <OperationArea
          createNewAction={createNewAction}
          createNewCategory={createNewCategory}
          categories={categories}
          archivedCategories={archivedCategories}
          archivedActions={archivedActions}
        ></OperationArea>
        <KanbanBoard
          defaultCols={columns}
          initialTasks={tasks}
          onUpdateColumns={onUpdateColumns}
          renderNewTask={(renderProps) => (
            <NewActionModal
              categories={categories}
              category_id={renderProps.columnId as number}
              createNewAction={createNewAction}
              disabled={renderProps.isDisabled}
            ></NewActionModal>
          )}
          renderEditTask={(renderProps) => (
            <ActionMenu action={actions.find((t) => renderProps.id === t.id)!}>
              <EditActionModal
                categories={categories}
                category_id={renderProps.columnId as number}
                updateAction={updateAction}
                action={actions.find((t) => renderProps.id === t.id)!}
              ></EditActionModal>
            </ActionMenu>
          )}
          renderEditColumn={(renderProps) => (
            <CategoryMenu
              category={categories.find((c) => renderProps.id === c.id)!}
            >
              <EditCategoryModal
                updateCategory={updateCategory}
                category={categories.find((c) => renderProps.id === c.id)!}
              ></EditCategoryModal>
            </CategoryMenu>
          )}
          updateTaskOrders={updateTaskOrders}
        />
      </div>
    </KanbanBoardProvider>
  );
}

function OperationArea({
  // updatingTasks,
  // onUpdated,
  createNewAction,
  createNewCategory,
  // updateActionOrders,
  categories,
  archivedCategories,
  archivedActions,
}: {
  archivedCategories: { id: number; name: string }[];
  archivedActions: {
    id: number;
    name: string;
    point: number;
    categoryName: string;
  }[];
  // updatingTasks: {
  //   taskId: UniqueIdentifier;
  //   columnId: UniqueIdentifier;
  //   order: number;
  // }[];
  // onUpdated: () => void;
  createNewAction: (data: {
    name: string;
    point: number;
    category_id: number;
  }) => Promise<void>;
  // updateActionOrders: (
  //   data: { category_id: number; id: number; order_id: number }[]
  // ) => Promise<void>;
  createNewCategory: (data: LocalShcmeaType) => Promise<void>;
  categories: {
    id: number;
    name: string;
    order_id: number;
  }[];
}) {
  const { isDirty } = useContext(KanbanBoardContext);

  return (
    <div className="flex space-x-3 max-w-screen-md">
      <NewActionModal
        categories={categories}
        createNewAction={createNewAction}
        disabled={isDirty}
      ></NewActionModal>
      <NewCategoryModal
        createNewCategory={createNewCategory}
        disabled={isDirty}
      ></NewCategoryModal>
      <ArchiveListModal
        archivedCategories={archivedCategories}
        archivedActions={archivedActions}
        disabled={isDirty}
      ></ArchiveListModal>
      {/* {isDirty && (
        <ActionSaveButton
          onClick={onSaveClick}
          isLoading={isLoading}
        ></ActionSaveButton>
      )} */}
    </div>
  );
}
