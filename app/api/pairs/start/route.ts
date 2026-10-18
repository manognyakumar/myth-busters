import { z } from "zod";
import { body, limitIp, requirePlayerId, route, rpc } from "@/lib/server/handler";
import { serveDrafts } from "@/lib/server/supabase";

export const POST = route(async (req) => {
  const player = await requirePlayerId(req);
  await limitIp(req, "attempt");
  const { mode } = await body(req, z.object({ mode: z.enum(["easy", "challenge"]) }));
  return rpc("mb_start_pairs", { p_player: player, p_mode: `pairs_${mode}`, p_include_draft: serveDrafts() });
});
