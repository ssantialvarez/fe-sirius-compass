import { createBackendFetcher } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  props: { params: Promise<{ threadId: string }> }
) {
  const params = await props.params;
  const fetcher = await createBackendFetcher();
  const threadId = params.threadId;

  try {
    const endpoint = `/chat/threads/${threadId}`;
    console.log(`[API] Deleting thread: ${endpoint}`);
    const res = await fetcher.fetchWithAuth(endpoint, {
      method: "DELETE",
    });

    console.log(`[API] Backend response status: ${res.status}`);

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error(`[API] Delete error:`, e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ threadId: string }> }
) {
  const params = await props.params;
  const fetcher = await createBackendFetcher();
  const threadId = params.threadId;

  try {
    const body = await request.json().catch(() => ({}));
    const endpoint = `/chat/threads/${threadId}`;
    const res = await fetcher.fetchWithAuth(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error(`[API] Patch error:`, e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
