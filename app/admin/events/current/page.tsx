import { getCategories } from "@/features/action-page/category-service";
import { CurrentEventHome } from "@/features/event-page/current-event-home";
import {
  getCurrentEvent,
  archiveEvent,
  updateEvent,
  updateRankVisible,
  copyEvent,
} from "@/features/event-page/event-service";
import { getTeams } from "@/features/team-page/team-service";

export default async function Page() {
  const currentEvent = await getCurrentEvent();
  const categories = await getCategories();
  const { teams } = await getTeams({
    pageSize: 1000,
  });

  return (
    <CurrentEventHome
      event={currentEvent}
      updateEvent={updateEvent}
      teams={teams}
      categories={categories}
      archiveEvent={archiveEvent}
      updateRankVisible={updateRankVisible}
      copyEvent={copyEvent}
    ></CurrentEventHome>
  );
}
