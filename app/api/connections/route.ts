import { createBackendFetcher } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const fetcher = await createBackendFetcher();

  try {
    const url = new URL(request.url);
    const projectName = url.searchParams.get("project_name");

    const endpoint = projectName 
      ? `/connections?project_name=${encodeURIComponent(projectName)}`
      : "/connections";

    const res = await fetcher.fetchWithAuth(endpoint, { 
      cache: "no-store"
    });
    const data = await res.json().catch(() => []);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const fetcher = await createBackendFetcher();

  try {
    const body = await request.text();
    const res = await fetcher.fetchWithAuth("/connections", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body,
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

