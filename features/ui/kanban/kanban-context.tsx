"use client";
import { createContext, ReactNode, useState } from "react";

export const KanbanBoardContext = createContext<{
  setIsDirty: (isDirty: boolean) => void;
  isDirty: boolean;
  isAlreadyShowingToast: boolean;
  setIsAlreadyShowingToast: (isAlreadyShowingToast: boolean) => void;
}>({
  setIsDirty: () => {},
  isDirty: false,
  isAlreadyShowingToast: false,
  setIsAlreadyShowingToast: () => {},
});

export function KanbanBoardProvider({ children }: { children: ReactNode }) {
  const [isDirty, setIsDirty] = useState(false);
  const [isAlreadyShowingToast, setIsAlreadyShowingToast] = useState(false);

  return (
    <KanbanBoardContext.Provider
      value={{
        setIsDirty,
        isDirty,
        isAlreadyShowingToast,
        setIsAlreadyShowingToast,
      }}
    >
      {children}
    </KanbanBoardContext.Provider>
  );
}
