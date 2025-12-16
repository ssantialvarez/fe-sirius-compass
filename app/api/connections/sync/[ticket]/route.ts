import { createBackendFetcher } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ ticket: string }> }
) {
  const { ticket } = await props.params;
  const fetcher = await createBackendFetcher();

  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    const endpoint = type
      ? `/connections/sync/${encodeURIComponent(ticket)}?type=${encodeURIComponent(type)}`
      : `/connections/sync/${encodeURIComponent(ticket)}`;

    const res = await fetcher.fetchWithAuth(endpoint, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
