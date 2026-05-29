import { router } from "./trpc";
import { tasksRouter } from "./routers/tasks";
import { entriesRouter } from "./routers/entries";
import { settingsRouter } from "./routers/settings";
import { challengesRouter } from "./routers/challenges";
import { mediaRouter } from "./routers/media";
import { statsRouter } from "./routers/stats";

export const appRouter = router({
  tasks: tasksRouter,
  entries: entriesRouter,
  settings: settingsRouter,
  challenges: challengesRouter,
  media: mediaRouter,
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;
