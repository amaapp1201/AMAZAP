import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/features/helpers/utils";

const plateVariants = cva(
  "bg-white border shadow-sm pb-4 pt-2 px-2 space-y-2"
  //   {
  //     variants: {
  //       variant: {
  //         default: "bg-primary text-primary-foreground hover:bg-primary/90",
  //         destructive:
  //           "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  //         outline:
  //           "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  //         secondary:
  //           "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  //         ghost: "hover:bg-accent hover:text-accent-foreground",
  //         link: "text-primary underline-offset-4 hover:underline",
  //       },
  //       size: {
  //         default: "h-10 px-4 py-2",
  //         sm: "h-9 rounded-md px-3",
  //         xs: "h-6 rounded-sm px-3",
  //         lg: "h-11 rounded-md px-8",
  //         icon: "h-10 w-10",
  //       },
  //     },
  //     defaultVariants: {
  //       variant: "default",
  //       size: "default",
  //     },
  //   }
);

export interface PlateProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const Plate = React.forwardRef<HTMLDivElement, PlateProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp className={cn(plateVariants({ className }))} ref={ref} {...props} />
    );
  }
);
Plate.displayName = "Plate";

export { Plate };
