import { requirePlayerId, route, rpc } from "@/lib/server/handler";
import { hashRecoveryCode, newRecoveryCode } from "@/lib/server/recovery";

/** Issues a new one-time recovery code (replacing any previous one). Only the hash is stored. */
export const POST = route(async (req) => {
  const player = await requirePlayerId(req);
  const code = newRecoveryCode();
  await rpc("mb_set_recovery_hash", { p_player: player, p_hash: hashRecoveryCode(code) });
  return { code };
});
