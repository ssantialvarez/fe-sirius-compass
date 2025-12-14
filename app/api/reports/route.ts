import { NextResponse } from "next/server";

const backendUrl = process.env.SIRIUS_BACKEND_URL ?? "http://localhost:8000";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const projectName = url.searchParams.get("project_name");
    const limit = url.searchParams.get("limit");

    const upstreamUrl = new URL(`${backendUrl}/reports`);
    if (projectName) upstreamUrl.searchParams.set("project_name", projectName);
    if (limit) upstreamUrl.searchParams.set("limit", limit);

    const res = await fetch(upstreamUrl.toString(), { cache: "no-store" });
    const data = await res.json().catch(() => []);
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

