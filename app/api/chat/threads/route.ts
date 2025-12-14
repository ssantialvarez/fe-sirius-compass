import { createBackendFetcher } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const fetcher = await createBackendFetcher();

  try {
    const endpoint = "/chat/threads";

    const res = await fetcher.fetchWithAuth(endpoint, { 
      cache: "no-store"
    }, {audience: process.env.AUTH0_AUDIENCE});
    const data = await res.json().catch(() => []);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

