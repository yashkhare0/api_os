"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createApiKey,
  createResponse,
  deleteResponse,
  revokeApiKey,
  setAppStatus,
  setEndpointStatus
} from "@/lib/admin-api";
import { clearAdminSession, requireAdmin } from "@/lib/session";

export type CreateKeyState = {
  apiKey?: string;
  error?: string;
};

export async function createKeyAction(_state: CreateKeyState, formData: FormData): Promise<CreateKeyState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Name is required." };
  }

  try {
    const result = await createApiKey(name);
    revalidateDashboard();
    return { apiKey: result.apiKey };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create API key." };
  }
}

export async function revokeKeyAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  await revokeApiKey(id);
  revalidateDashboard();
}

export async function setAppStatusAction(formData: FormData) {
  await requireAdmin();

  const slug = String(formData.get("slug") ?? "");
  const status = String(formData.get("status")) === "disabled" ? "disabled" : "active";
  await setAppStatus(slug, status);
  revalidateDashboard();
}

export async function setEndpointStatusAction(formData: FormData) {
  await requireAdmin();

  const method = String(formData.get("method") ?? "");
  const path = String(formData.get("path") ?? "");
  const status = String(formData.get("status")) === "disabled" ? "disabled" : "active";
  await setEndpointStatus(method, path, status);
  revalidateDashboard();
}

export async function createResponseAction(formData: FormData) {
  await requireAdmin();

  const endpoint = String(formData.get("endpoint") ?? "");
  const [appSlug, method, ...pathParts] = endpoint.split("|");
  const path = pathParts.join("|");
  const name = String(formData.get("name") ?? "").trim();
  const statusCode = Number(formData.get("statusCode") ?? 200);
  const body = String(formData.get("body") ?? "").trim();

  if (!appSlug || !method || !path || !name || !body || !Number.isInteger(statusCode)) {
    throw new Error("Response endpoint, name, status code, and JSON body are required.");
  }

  JSON.parse(body);

  await createResponse({
    appSlug,
    method,
    path,
    name,
    statusCode,
    body
  });
  revalidateDashboard();
}

export async function deleteResponseAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  await deleteResponse(id);
  revalidateDashboard();
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/login");
}

function revalidateDashboard() {
  revalidatePath("/dashboard", "layout");
}
