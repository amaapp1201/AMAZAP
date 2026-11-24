import { Footter } from "@/features/ui/footter";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-stretch h-screen">
      <div className="flex-1 themes-wrapper bg-background w-full flex items-center justify-center px-4">
        {children}
      </div>
      <Footter></Footter>
    </div>
  );
}
