import { createContext, ReactNode, useContext, useState } from "react";
import { Button } from "../ui/button";

export const ActionSaveContext = createContext<{
  showSaveButton: boolean;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  setShowSaveButton: (showSaveButton: boolean) => void;
}>({
  showSaveButton: false,
  isEditing: false,
  setIsEditing: () => {},
  setShowSaveButton: () => {},
});

export function ActionSaveProvider({ children }: { children: ReactNode }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);

  return (
    <ActionSaveContext.Provider
      value={{ showSaveButton, isEditing, setIsEditing, setShowSaveButton }}
    >
      {children}
    </ActionSaveContext.Provider>
  );
}

// 今のところcontextつかってない
export function ActionSaveButton({
  onClick,
  isLoading,
}: {
  onClick: () => void;
  isLoading: boolean;
}) {
  //   const { showSaveButton } = useContext(ActionSaveContext);

  //   if (!showSaveButton) return null;

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      isLoading={isLoading}
      size="sm"
    >
      変更を保存する
    </Button>
  );
}
