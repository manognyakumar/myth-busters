import { z } from "zod";
import { ApiError, body, limitIp, requirePlayerId, route, rpc } from "@/lib/server/handler";
import { checkNickname } from "@/lib/server/nickname";

const Profile = z.object({
  nickname: z.string().max(40),
  character: z.enum(["pinky", "rosie", "bloom", "monster", "captain"]),
});

export const GET = route(async (req) => {
  const player = await requirePlayerId(req);
  return { profile: await rpc("mb_get_profile", { p_player: player }) };
});

export const POST = route(async (req) => {
  const player = await requirePlayerId(req);
  await limitIp(req, "profile", 120);
  const { nickname, character } = await body(req, Profile);
  const problem = checkNickname(nickname);
  if (problem) throw new ApiError(400, problem);
  const clean = nickname.trim().replace(/\s+/g, " ");
  return { profile: await rpc("mb_set_profile", { p_player: player, p_nickname: clean, p_character: character }) };
});

export const DELETE = route(async (req) => {
  const player = await requirePlayerId(req);
  await rpc("mb_delete_player", { p_player: player });
  return { ok: true };
});
