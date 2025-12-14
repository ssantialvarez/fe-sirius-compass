import { NextResponse } from "next/server";

const backendUrl = process.env.SIRIUS_BACKEND_URL ?? "http://localhost:8000";

export async function GET(
  request: Request,
  { params }: { params: { threadId: string } },
) {
  const { threadId } = await params;
  
  if (!threadId || threadId === "undefined") {
    return NextResponse.json({ error: "Invalid threadId" }, { status: 400 });
  }
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");

    const upstreamUrl = new URL(`${backendUrl}/chat/threads/${threadId}/messages`);
    if (limit) upstreamUrl.searchParams.set("limit", limit);

    const res = await fetch(upstreamUrl.toString(), { cache: "no-store" });
    const data = await res.json().catch(() => []);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

