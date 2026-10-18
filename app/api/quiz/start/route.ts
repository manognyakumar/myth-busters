import { z } from "zod";
import { body, limitIp, requirePlayerId, route, rpc } from "@/lib/server/handler";
import { serveDrafts } from "@/lib/server/supabase";

const Start = z.object({ category: z.enum(["basics", "signs", "risk", "ultimate"]), timed: z.boolean() });

export const POST = route(async (req) => {
  const player = await requirePlayerId(req);
  await limitIp(req, "attempt");
  const { category, timed } = await body(req, Start);
  return rpc("mb_start_quiz", { p_player: player, p_category: category, p_timed: timed, p_include_draft: serveDrafts() });
});
