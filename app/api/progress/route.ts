import { requirePlayerId, route, rpc } from "@/lib/server/handler";

export const GET = route(async (req) => {
  const player = await requirePlayerId(req);
  return rpc("mb_my_progress", { p_player: player });
});
