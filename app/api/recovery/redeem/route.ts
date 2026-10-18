import { z } from "zod";
import { body, limitIp, requirePlayerId, route, rpc } from "@/lib/server/handler";
import { hashRecoveryCode } from "@/lib/server/recovery";

export const POST = route(async (req) => {
  const player = await requirePlayerId(req);
  await limitIp(req, "recovery", 20);
  const { code } = await body(req, z.object({ code: z.string().min(12).max(20) }));
  return { profile: await rpc("mb_redeem_recovery", { p_new_player: player, p_hash: hashRecoveryCode(code) }) };
});
