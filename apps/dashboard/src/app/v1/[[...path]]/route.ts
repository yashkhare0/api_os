import { handleEmbeddedApiRequest } from "@/lib/embedded-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handleEmbeddedApiRequest;
export const POST = handleEmbeddedApiRequest;
export const OPTIONS = handleEmbeddedApiRequest;
