import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError, type ZodType } from "zod";
import { adminSupabase } from "./supabase";

export class ApiError extends Error {
  constructor(public status: number, public code: string) {
    super(code);
  }
}

const RPC_ERRORS: Record<string, number> = {
  no_profile: 409,
  nickname_taken: 409,
  rate_limited: 429,
  not_found: 404,
  attempt_closed: 409,
  already_answered: 409,
  already_matched: 409,
  out_of_order: 409,
  incomplete: 409,
  invalid_code: 400,
  device_has_progress: 409,
  not_enough_questions: 503,
  not_enough_pairs: 503,
};

/** Calls a service-role RPC and maps raised `P0001` errors to HTTP errors. */
export async function rpc<T = unknown>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await adminSupabase().rpc(fn, args);
  if (error) {
    const code = error.message;
    if (error.code === "P0001" && code in RPC_ERRORS) throw new ApiError(RPC_ERRORS[code], code);
    if (error.code === "P0001") throw new ApiError(400, code);
    console.error(`[rpc ${fn}]`, error);
    throw new ApiError(500, "server_error");
  }
  return data as T;
}

/** Verifies the caller's Supabase (anonymous) access token and returns their user id. */
export async function requirePlayerId(req: NextRequest): Promise<string> {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new ApiError(401, "unauthenticated");
  const { data, error } = await adminSupabase().auth.getUser(token);
  if (error || !data.user) throw new ApiError(401, "unauthenticated");
  return data.user.id;
}

export async function optionalPlayerId(req: NextRequest): Promise<string | null> {
  try {
    return await requirePlayerId(req);
  } catch {
    return null;
  }
}

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-nf-client-connection-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

/** Generous per-IP limit: campus NAT and booth tablets put many real players behind one address. */
export async function limitIp(req: NextRequest, bucket: string, limit = 300) {
  const ok = await rpc<boolean>("mb_rate_check", {
    p_key: `ip:${bucket}:${clientIp(req)}`,
    p_limit: limit,
    p_window: "1 hour",
  });
  if (!ok) throw new ApiError(429, "rate_limited");
}

export async function body<T>(req: NextRequest, schema: ZodType<T>): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new ApiError(400, "invalid_json");
  }
  return schema.parse(json);
}

export function route(fn: (req: NextRequest) => Promise<unknown>) {
  return async (req: NextRequest) => {
    try {
      const data = await fn(req);
      return NextResponse.json(data ?? { ok: true }, { headers: { "cache-control": "no-store" } });
    } catch (e) {
      if (e instanceof ApiError) return NextResponse.json({ error: e.code }, { status: e.status });
      if (e instanceof ZodError) return NextResponse.json({ error: "invalid_input", issues: e.issues }, { status: 400 });
      console.error(e);
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  };
}
