import { z } from "zod";
import { body, requirePlayerId, route, rpc } from "@/lib/server/handler";

export const POST = route(async (req) => {
  const player = await requirePlayerId(req);
  const { attemptId } = await body(req, z.object({ attemptId: z.string().uuid() }));
  return rpc("mb_complete_quiz", { p_player: player, p_attempt: attemptId });
});
