import { Control, FieldPath, FieldValues, useWatch } from "react-hook-form";
import { cn } from "../helpers/utils";

export function RemainingChars<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  maxLength,
  control,
  name,
}: {
  maxLength: number;
  control: Control<TFieldValues, any>;
  name: TName;
}) {
  const targetText = useWatch({
    control: control,
    name: name,
  });

  const currentLength = targetText?.length ?? 0;

  const remaining = maxLength - currentLength;

  return (
    <div
      className={cn(
        "text-sm",
        remaining < 0 ? "text-red-500" : "text-gray-500"
      )}
    >
      残り文字数: {remaining}
    </div>
  );
}
