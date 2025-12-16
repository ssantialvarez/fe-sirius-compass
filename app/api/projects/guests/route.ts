import { createBackendFetcher } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const fetcher = await createBackendFetcher();

  try {
    const body = await request.text();
    const res = await fetcher.fetchWithAuth("/projects/guests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
