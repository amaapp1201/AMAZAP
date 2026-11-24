import { Footter } from "@/features/ui/footter";
import { ReactNode } from "react";

// ヘッダーは、どのイベントを表示するか（?event=）で内容が変わるため、ページ側で描画する
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
      <Footter></Footter>
    </div>
  );
}
