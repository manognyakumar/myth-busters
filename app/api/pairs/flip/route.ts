import { z } from "zod";
import { body, requirePlayerId, route, rpc } from "@/lib/server/handler";

const F = z.object({ attemptId: z.string().uuid(), a: z.string().max(20), b: z.string().max(20) });

export const POST = route(async (req) => {
  const player = await requirePlayerId(req);
  const { attemptId, a, b } = await body(req, F);
  return rpc("mb_flip_pair", { p_player: player, p_attempt: attemptId, p_card_a: a, p_card_b: b });
});
