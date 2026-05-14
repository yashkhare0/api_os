import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("cleanup expired journey state", { hours: 1 }, internal.state.cleanupExpired);

export default crons;
