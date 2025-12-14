import { createBackendFetcher } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const fetcher = await createBackendFetcher();
  const id = params.id;

  try {
    const endpoint = `/reports/${id}`;
    const res = await fetcher.fetchWithAuth(endpoint, {
      method: "DELETE",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
