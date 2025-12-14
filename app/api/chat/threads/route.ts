import { NextResponse } from "next/server";

const backendUrl = process.env.SIRIUS_BACKEND_URL ?? "http://localhost:8000";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("user_id");

    const upstreamUrl = new URL(`${backendUrl}/chat/threads`);
    if (userId) upstreamUrl.searchParams.set("user_id", userId);

    const res = await fetch(upstreamUrl.toString(), { cache: "no-store" });
    const data = await res.json().catch(() => []);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

