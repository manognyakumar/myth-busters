"use client";

import { useCallback, useEffect, useState } from "react";
import { browserSupabase } from "@/lib/supabase/browser";
import { apiPublic, ApiFailure } from "@/lib/player";
import type { CharacterId } from "@/lib/characters";

export type Row = {
  rank: number;
  nickname: string;
  character: CharacterId;
  total_nmbp: number;
  rounds_completed: number;
  categories_completed: number;
  avg_nmbp: number;
};
export type Me = {
  profile: { nickname: string; character: CharacterId } | null;
  total_nmbp: number;
  rounds_completed: number;
  categories_completed: number;
  rank: number | null;
  achievements: { earned: boolean }[];
};
export type Board = { total_players: number; rows: Row[]; page: number; page_size: number; me: Me | null };

const POLL_MS = 10_000;

/** The one global leaderboard, kept fresh by a realtime broadcast with a 10s polling fallback. */
export function useLeaderboard(page = 0) {
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setBoard(await apiPublic<Board>(`/api/leaderboard?page=${page}`));
      setError(null);
    } catch (e) {
      setError(e instanceof ApiFailure ? e.code : "server_error");
    }
  }, [page]);

  useEffect(() => {
    void load();
    const poll = setInterval(load, POLL_MS);
    const sb = browserSupabase();
    const channel = sb
      .channel("leaderboard")
      .on("broadcast", { event: "leaderboard_changed" }, () => void load())
      .subscribe();
    return () => {
      clearInterval(poll);
      void sb.removeChannel(channel);
    };
  }, [load]);

  return { board, error, reload: load };
}
