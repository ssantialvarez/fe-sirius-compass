import { createBackendFetcher } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await params;
  const fetcher = await createBackendFetcher();
  
  if (!threadId || threadId === "undefined") {
    return NextResponse.json({ error: "Invalid threadId" }, { status: 400 });
  }
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit");

    const endpoint = limit 
      ? `/chat/threads/${threadId}/messages?limit=${limit}`
      : `/chat/threads/${threadId}/messages`;

    const res = await fetcher.fetchWithAuth(endpoint, { cache: "no-store" });
    const data = await res.json().catch(() => []);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

