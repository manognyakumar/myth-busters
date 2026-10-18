import type { NextRequest } from "next/server";
import { z } from "zod";
import { requirePlayerId, route, rpc } from "@/lib/server/handler";

export const GET = route(async (req: NextRequest) => {
  const player = await requirePlayerId(req);
  const id = z.string().uuid().parse(req.nextUrl.pathname.split("/").pop());
  return rpc("mb_attempt_result", { p_player: player, p_attempt: id });
});
