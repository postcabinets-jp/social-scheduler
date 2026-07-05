"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "./workspace";

export async function getSocialAccounts() {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return [];

  const { data } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("workspace_id", workspace.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function disconnectAccount(accountId: string) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace" };

  const { error } = await supabase
    .from("social_accounts")
    .update({ is_active: false })
    .eq("id", accountId)
    .eq("workspace_id", workspace.id);

  if (error) return { error: error.message };

  revalidatePath("/settings/accounts");
  return { success: true };
}

export async function connectAccount(
  platform: string,
  platformUserId: string,
  displayName: string,
  accessToken: string,
  options?: {
    username?: string;
    avatarUrl?: string;
    refreshToken?: string;
    tokenExpiresAt?: string;
  }
) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace" };

  const { data, error } = await supabase
    .from("social_accounts")
    .upsert(
      {
        workspace_id: workspace.id,
        platform,
        platform_user_id: platformUserId,
        display_name: displayName,
        username: options?.username ?? null,
        avatar_url: options?.avatarUrl ?? null,
        access_token_enc: accessToken,
        refresh_token_enc: options?.refreshToken ?? null,
        token_expires_at: options?.tokenExpiresAt ?? null,
        is_active: true,
      },
      { onConflict: "workspace_id,platform,platform_user_id" }
    )
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/settings/accounts");
  revalidatePath("/compose");
  revalidatePath("/dashboard");
  return { success: true, account: data };
}

export async function reconnectAccount(accountId: string) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace" };

  const { data: account } = await supabase
    .from("social_accounts")
    .select("platform")
    .eq("id", accountId)
    .eq("workspace_id", workspace.id)
    .single();

  if (!account) return { error: "Account not found" };

  // In production, this would initiate OAuth re-authorization
  // Return the redirect URL for the OAuth flow
  return {
    redirectUrl: `/api/auth/connect/${account.platform}?reconnect=${accountId}`,
  };
}

export async function updateAccountTokens(
  accountId: string,
  accessToken: string,
  refreshToken?: string,
  expiresAt?: string
) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace" };

  const { error } = await supabase
    .from("social_accounts")
    .update({
      access_token_enc: accessToken,
      refresh_token_enc: refreshToken ?? null,
      token_expires_at: expiresAt ?? null,
      is_active: true,
      last_synced_at: new Date().toISOString(),
    })
    .eq("id", accountId)
    .eq("workspace_id", workspace.id);

  if (error) return { error: error.message };

  revalidatePath("/settings/accounts");
  return { success: true };
}

export async function getAnalyticsOverview() {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;

  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("id, platform, display_name, username, avatar_url, follower_count")
    .eq("workspace_id", workspace.id)
    .eq("is_active", true);

  if (!accounts?.length) return { accounts: [], snapshots: [] };

  const accountIds = accounts.map((a) => a.id);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: snapshots } = await supabase
    .from("analytics_snapshots")
    .select("*")
    .in("social_account_id", accountIds)
    .gte("snapshot_date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("snapshot_date", { ascending: true });

  return { accounts, snapshots: snapshots ?? [] };
}
