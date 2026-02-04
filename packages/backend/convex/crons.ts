import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "cleanup expired sessions",
  { hours: 1 },
  internal.cleanup.deleteExpiredSessions
);

crons.interval(
  "cleanup abandoned carts",
  { hours: 6 },
  internal.cleanup.deleteAbandonedCarts
);

export default crons;
