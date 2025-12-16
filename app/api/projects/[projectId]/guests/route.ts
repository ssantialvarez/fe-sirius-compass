import { createBackendFetcher } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  props: { params: Promise<{ projectId: string }> }
) {
  const params = await props.params;
  const fetcher = await createBackendFetcher();

  try {
    const endpoint = `/projects/${encodeURIComponent(params.projectId)}/guests`;
    const res = await fetcher.fetchWithAuth(endpoint, { cache: "no-store" });
    const data = await res.json().catch(() => []);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
