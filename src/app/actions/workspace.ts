"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentWorkspace() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_workspace_id")
    .eq("id", user.id)
    .single();

  if (!profile?.current_workspace_id) return null;

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", profile.current_workspace_id)
    .single();

  return workspace;
}

export async function getUserWorkspaces() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(*)")
    .eq("user_id", user.id);

  return memberships ?? [];
}

export async function switchWorkspace(workspaceId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify user is a member
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (!membership) return { error: "Not a member of this workspace" };

  await supabase
    .from("profiles")
    .update({ current_workspace_id: workspaceId })
    .eq("id", user.id);

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateWorkspaceSettings(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found" };

  const aiProvider = formData.get("ai_provider") as string | null;
  const aiApiKey = formData.get("ai_api_key") as string | null;

  const { error } = await supabase
    .from("workspaces")
    .update({
      name: formData.get("name") as string,
      timezone: formData.get("timezone") as string,
      ...(aiProvider ? { ai_provider: aiProvider } : {}),
      ...(aiApiKey ? { ai_api_key_enc: aiApiKey } : {}),
    })
    .eq("id", workspace.id);

  if (error) return { error: error.message };

  revalidatePath("/settings/workspace");
  return { success: true };
}

export async function inviteMember(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace found" };

  const email = formData.get("email") as string;
  const role = formData.get("role") as string;

  // Find user by email
  const { data: invitedUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", email) // simplified - real impl uses email lookup via auth
    .single();

  if (!invitedUser) {
    return { error: "User not found. They must sign up first." };
  }

  const { error } = await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: invitedUser.id,
    role: role as "admin" | "editor" | "viewer",
    invited_by: user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/settings/team");
  return { success: true };
}
