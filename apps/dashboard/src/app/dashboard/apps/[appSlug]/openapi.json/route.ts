import { NextResponse } from "next/server";
import { buildAppOpenApiDocument } from "@/lib/openapi";
import { getPublicApiBaseUrl } from "@/lib/public-api-base-url";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ appSlug: string }> }
) {
  await requireAdmin();

  const { appSlug } = await params;
  const decodedSlug = decodeURIComponent(appSlug);
  const baseUrl = await getPublicApiBaseUrl();
  const document = buildAppOpenApiDocument(decodedSlug, baseUrl);

  if (!document) {
    return NextResponse.json({ error: "App not found." }, { status: 404 });
  }

  return NextResponse.json(document, {
    headers: {
      "content-disposition": `inline; filename="${safeFileName(decodedSlug)}-openapi.json"`
    }
  });
}

function safeFileName(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]+/g, "-");
}
