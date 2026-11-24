import { getCategories } from "@/features/action-page/action-service";
import {
  copyEvent,
  getPastEvents,
  publishEvent,
  updateRankVisible,
} from "@/features/event-page/event-service";
import { PastEventHome } from "@/features/event-page/past-event-home";
import { getTeams } from "@/features/team-page/team-service";

export default async function Page() {
  const pastEvents = await getPastEvents();
  const categories = await getCategories();
  const { teams } = await getTeams({
    pageSize: 1000,
  });

  return (
    <PastEventHome
      events={pastEvents}
      categories={categories}
      teams={teams}
      publishEvent={publishEvent}
      updateRankVisible={updateRankVisible}
      copyEvent={copyEvent}
    ></PastEventHome>
  );
}
