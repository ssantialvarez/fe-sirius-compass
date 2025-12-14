import { NextResponse } from "next/server";

const backendUrl = process.env.SIRIUS_BACKEND_URL ?? "http://localhost:8000";

export async function POST(request: Request) {
  const accept = request.headers.get("accept") ?? "";

  try {
    const body = await request.text();
    const res = await fetch(`${backendUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: accept,
      },
      body,
    });

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("text/event-stream")) {
      return new Response(res.body, {
        status: res.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

