import { getCategories } from "@/features/action-page/category-service";
import {
  copyEvent,
  createEvent,
  getPlanningEvents,
  publishEvent,
  updateEvent,
  updateRankVisible,
} from "@/features/event-page/event-service";
import { PlanningEventHome } from "@/features/event-page/planning-event-home";
import { getTeams } from "@/features/team-page/team-service";

export default async function Page() {
  const planningEvents = await getPlanningEvents();
  const categories = await getCategories();
  const { teams } = await getTeams({
    pageSize: 1000,
  });

  return (
    <PlanningEventHome
      events={planningEvents}
      createEvent={createEvent}
      categories={categories}
      teams={teams}
      updateEvent={updateEvent}
      publishEvent={publishEvent}
      updateRankVisible={updateRankVisible}
      copyEvent={copyEvent}
    ></PlanningEventHome>
  );
}
