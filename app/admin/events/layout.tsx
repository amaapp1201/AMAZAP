import { getCategories } from "@/features/action-page/category-service";
import { createEvent } from "@/features/event-page/event-service";
import { EventTabMenu } from "@/features/event-page/event-tab";
import { NewEventSheet } from "@/features/event-page/new-event-sheet";
import { getTeams } from "@/features/team-page/team-service";
import { ScrollArea } from "@/features/ui/scroll-area";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();
  const { teams } = await getTeams({
    pageSize: 1000,
  });

  return (
    <div className="p-3 flex flex-col space-y-4">
      <div className="grid grid-cols-[7fr_3fr] gap-3 items-center">
        <EventTabMenu></EventTabMenu>
        <NewEventSheet
          createEvent={createEvent}
          categories={categories}
          teams={teams}
        ></NewEventSheet>
      </div>
      <ScrollArea className="max-h-full">{children}</ScrollArea>
    </div>
  );
}
