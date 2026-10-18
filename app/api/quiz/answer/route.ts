import { z } from "zod";
import { body, requirePlayerId, route, rpc } from "@/lib/server/handler";

const A = z.object({
  attemptId: z.string().uuid(),
  idx: z.number().int().min(0).max(14),
  choice: z.enum(["MYTH", "FACT", "NOT_SURE", "TIMEOUT"]),
});

export const POST = route(async (req) => {
  const player = await requirePlayerId(req);
  const { attemptId, idx, choice } = await body(req, A);
  return rpc("mb_submit_answer", { p_player: player, p_attempt: attemptId, p_idx: idx, p_choice: choice });
});
