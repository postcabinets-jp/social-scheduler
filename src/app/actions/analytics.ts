"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "./workspace";

export async function getPostAnalytics(postId: string) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;

  // Verify post belongs to workspace
  const { data: post } = await supabase
    .from("posts")
    .select("id")
    .eq("id", postId)
    .eq("workspace_id", workspace.id)
    .single();

  if (!post) return null;

  const { data: channels } = await supabase
    .from("post_channels")
    .select(
      `
      id,
      status,
      platform_post_id,
      published_at,
      error_message,
      social_accounts(id, platform, display_name, username),
      post_analytics(*)
    `
    )
    .eq("post_id", postId);

  return channels ?? [];
}

export async function getAccountAnalytics(
  accountId: string,
  days: number = 30
) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;

  // Verify account belongs to workspace
  const { data: account } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("id", accountId)
    .eq("workspace_id", workspace.id)
    .single();

  if (!account) return null;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const { data: snapshots } = await supabase
    .from("analytics_snapshots")
    .select("*")
    .eq("social_account_id", accountId)
    .gte("snapshot_date", cutoff.toISOString().split("T")[0])
    .order("snapshot_date", { ascending: true });

  // Get published posts for this account in the same period
  const { data: postChannels } = await supabase
    .from("post_channels")
    .select(
      `
      id,
      published_at,
      post_analytics(*),
      posts!inner(id, content, workspace_id)
    `
    )
    .eq("social_account_id", accountId)
    .eq("status", "published")
    .not("published_at", "is", null);

  // Filter to workspace (RLS should handle this but be safe)
  const workspacePosts = (postChannels ?? []).filter(
    (pc) =>
      pc.posts &&
      (pc.posts as { workspace_id: string }).workspace_id === workspace.id
  );

  return {
    account,
    snapshots: snapshots ?? [],
    posts: workspacePosts,
  };
}

export async function getDashboardAnalyticsSummary() {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;

  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("id, platform, display_name, follower_count")
    .eq("workspace_id", workspace.id)
    .eq("is_active", true);

  if (!accounts?.length) return { totalFollowers: 0, accountCount: 0, recentImpressions: 0, recentEngagements: 0 };

  const totalFollowers = accounts.reduce(
    (sum, a) => sum + (a.follower_count ?? 0),
    0
  );

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const accountIds = accounts.map((a) => a.id);
  const { data: snapshots } = await supabase
    .from("analytics_snapshots")
    .select("total_impressions, total_engagements")
    .in("social_account_id", accountIds)
    .gte("snapshot_date", sevenDaysAgo.toISOString().split("T")[0]);

  const recentImpressions = (snapshots ?? []).reduce(
    (sum, s) => sum + (s.total_impressions ?? 0),
    0
  );
  const recentEngagements = (snapshots ?? []).reduce(
    (sum, s) => sum + (s.total_engagements ?? 0),
    0
  );

  return {
    totalFollowers,
    accountCount: accounts.length,
    recentImpressions,
    recentEngagements,
  };
}
