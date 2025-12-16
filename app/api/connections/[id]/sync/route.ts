import { createBackendFetcher } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const fetcher = await createBackendFetcher();

  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    // Pass-through body (if the backend expects extra fields)
    const body = await request.text().catch(() => "");

    const endpoint = type
      ? `/connections/${encodeURIComponent(id)}/sync?type=${encodeURIComponent(type)}`
      : `/connections/${encodeURIComponent(id)}/sync`;

    const res = await fetcher.fetchWithAuth(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body || undefined,
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
