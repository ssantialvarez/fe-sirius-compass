import { createBackendFetcher } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const fetcher = await createBackendFetcher();

  try {
    const url = new URL(request.url);
    const projectName = url.searchParams.get("project_name");
    const limit = url.searchParams.get("limit");

    const params = new URLSearchParams();
    if (projectName) params.set("project_name", projectName);
    if (limit) params.set("limit", limit);

    const endpoint = params.toString() ? `/reports?${params}` : "/reports";

    const res = await fetcher.fetchWithAuth(endpoint, { 
      cache: "no-store"
    });
    const data = await res.json().catch(() => []);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

