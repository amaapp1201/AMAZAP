import { getCategories } from "@/features/action-page/category-service";
import { CurrentEventHome } from "@/features/event-page/current-event-home";
import {
  getCurrentEvents,
  archiveEvent,
  updateEvent,
  updateRankVisible,
  copyEvent,
} from "@/features/event-page/event-service";
import { getTeams } from "@/features/team-page/team-service";

export default async function Page() {
  const currentEvents = await getCurrentEvents();
  const categories = await getCategories();
  const { teams } = await getTeams({
    pageSize: 1000,
  });

  return (
    <CurrentEventHome
      events={currentEvents}
      updateEvent={updateEvent}
      teams={teams}
      categories={categories}
      archiveEvent={archiveEvent}
      updateRankVisible={updateRankVisible}
      copyEvent={copyEvent}
    ></CurrentEventHome>
  );
}
