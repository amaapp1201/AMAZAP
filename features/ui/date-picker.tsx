"use client";

import * as React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";
import { ja } from "date-fns/locale";

import { cn, formatToJst } from "@/features/helpers/utils";
import { Button } from "@/features/ui/button";
import { Calendar } from "@/features/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/features/ui/popover";

export function DatePicker({
  defaultIsoDate,
  onSetDate,
  disabled,
}: {
  defaultIsoDate: string;
  onSetDate: (date: string) => void;
  disabled: {
    isoBefore: string | null;
    isoAfter: string | null;
  };
}) {
  const date = new Date(defaultIsoDate);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[200px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            formatToJst(date, "PPP", {
              locale: ja,
            })
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(val) => val && onSetDate(val.toISOString())}
          initialFocus
          defaultMonth={date}
          disabled={
            {
              before: disabled.isoBefore
                ? new Date(disabled.isoBefore)
                : undefined,
              after: disabled.isoAfter
                ? new Date(disabled.isoAfter)
                : undefined,
            } as any
          }
        />
      </PopoverContent>
    </Popover>
  );
}
