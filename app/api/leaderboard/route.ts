import { optionalPlayerId, route, rpc } from "@/lib/server/handler";

const PAGE = 50;

/** The one global leaderboard. Public; adds the caller's own ranking when a token is sent. */
export const GET = route(async (req) => {
  const page = Math.max(0, Number(req.nextUrl.searchParams.get("page") ?? 0) || 0);
  const player = await optionalPlayerId(req);
  const [board, me] = await Promise.all([
    rpc<{ total_players: number; rows: unknown[] }>("mb_leaderboard", { p_limit: PAGE, p_offset: page * PAGE }),
    player ? rpc("mb_my_progress", { p_player: player }) : Promise.resolve(null),
  ]);
  return { ...board, page, page_size: PAGE, me };
});
