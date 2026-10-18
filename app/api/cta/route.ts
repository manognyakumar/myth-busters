import { z } from "zod";
import { body, limitIp, route, rpc } from "@/lib/server/handler";

/** Anonymous conversion counters for the club call-to-action. No personal data. */
export const POST = route(async (req) => {
  await limitIp(req, "cta", 600);
  const { event } = await body(req, z.object({ event: z.enum(["results_shown", "join_clicked"]) }));
  await rpc("mb_track_cta", { p_event: event });
  return { ok: true };
});
