import { z } from "zod";
import { body, requirePlayerId, route, rpc } from "@/lib/server/handler";

const Q = z.object({ attemptId: z.string().uuid(), idx: z.number().int().min(0).max(14) });

export const POST = route(async (req) => {
  const player = await requirePlayerId(req);
  const { attemptId, idx } = await body(req, Q);
  return rpc("mb_serve_question", { p_player: player, p_attempt: attemptId, p_idx: idx });
});
