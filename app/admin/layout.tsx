import { auth } from "@/features/helpers/auth";
import { Footter } from "@/features/ui/footter";
import { MainNavbar } from "@/features/ui/main-navbar";
import { ScrollArea, ScrollBar } from "@/features/ui/scroll-area";
import { Sidebar } from "@/features/ui/sidebar";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!(session && session.user.isAdmin)) {
    // セキュリティのため、管理者以外はアクセス不可
    notFound();
  }

  return (
    <div className="h-screen w-screen">
      <div className="grid grid-rows-[min-content_minmax(0,1fr)_min-content] h-full w-full">
        <MainNavbar />
        <main className="grid grid-cols-[110px_auto]">
          <div className="lg:block bg-white">
            <Sidebar />
          </div>
          <ScrollArea className="h-full w-full overflow-auto">
            {children}
            <ScrollBar></ScrollBar>
            <ScrollBar orientation="horizontal"></ScrollBar>
          </ScrollArea>
        </main>
        <Footter></Footter>
      </div>
    </div>
  );
}
