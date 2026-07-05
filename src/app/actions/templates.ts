"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "./workspace";

export async function getTemplates() {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return [];

  const { data } = await supabase
    .from("post_templates")
    .select("*")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function createTemplate(formData: FormData) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const name = formData.get("name") as string;
  const content = formData.get("content") as string;
  const platformsRaw = formData.get("platforms") as string;
  const platforms = platformsRaw ? JSON.parse(platformsRaw) : [];

  if (!name?.trim() || !content?.trim()) {
    return { error: "名前とコンテンツは必須です" };
  }

  const { data, error } = await supabase
    .from("post_templates")
    .insert({
      workspace_id: workspace.id,
      created_by: user.id,
      name,
      content,
      platforms,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/templates");
  return { success: true, template: data };
}

export async function updateTemplate(
  templateId: string,
  formData: FormData
) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace" };

  const name = formData.get("name") as string;
  const content = formData.get("content") as string;
  const platformsRaw = formData.get("platforms") as string;
  const platforms: string[] | undefined = platformsRaw
    ? JSON.parse(platformsRaw)
    : undefined;

  const { error } = await supabase
    .from("post_templates")
    .update({
      ...(name ? { name } : {}),
      ...(content ? { content } : {}),
      ...(platforms !== undefined ? { platforms } : {}),
    })
    .eq("id", templateId)
    .eq("workspace_id", workspace.id);

  if (error) return { error: error.message };

  revalidatePath("/templates");
  return { success: true };
}

export async function deleteTemplate(templateId: string) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace" };

  const { error } = await supabase
    .from("post_templates")
    .delete()
    .eq("id", templateId)
    .eq("workspace_id", workspace.id);

  if (error) return { error: error.message };

  revalidatePath("/templates");
  return { success: true };
}
