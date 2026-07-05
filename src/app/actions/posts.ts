"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "./workspace";

export async function getPosts(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { data: [], count: 0 };

  let query = supabase
    .from("posts")
    .select(
      `
      *,
      post_channels(
        *,
        social_accounts(id, platform, display_name, username, avatar_url)
      ),
      post_media(*, media_assets(*))
    `,
      { count: "exact" }
    )
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options?.limit ?? 20) - 1
    );
  }

  const { data, error, count } = await query;
  if (error) return { data: [], count: 0, error: error.message };

  return { data: data ?? [], count: count ?? 0 };
}

export async function getScheduledPosts(start: string, end: string) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return [];

  const { data } = await supabase
    .from("posts")
    .select(
      `
      *,
      post_channels(
        *,
        social_accounts(id, platform, display_name, avatar_url)
      )
    `
    )
    .eq("workspace_id", workspace.id)
    .in("status", ["scheduled", "approved", "published"])
    .gte("scheduled_at", start)
    .lte("scheduled_at", end)
    .order("scheduled_at", { ascending: true });

  return data ?? [];
}

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const content = formData.get("content") as string;
  const scheduledAt = formData.get("scheduled_at") as string;
  const status = (formData.get("status") as string) || "draft";
  const channelIds = formData.getAll("channel_ids") as string[];
  const channelOverrides = JSON.parse(
    (formData.get("channel_overrides") as string) || "{}"
  );

  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      workspace_id: workspace.id,
      created_by: user.id,
      content,
      status: status as "draft" | "scheduled" | "pending_approval",
      scheduled_at: scheduledAt || null,
    })
    .select()
    .single();

  if (postError) return { error: postError.message };

  if (channelIds.length > 0) {
    const channels = channelIds.map((accountId) => ({
      post_id: post.id,
      social_account_id: accountId,
      content_override: channelOverrides[accountId] || null,
      status: "pending" as const,
    }));

    const { error: channelError } = await supabase
      .from("post_channels")
      .insert(channels);

    if (channelError) return { error: channelError.message };
  }

  revalidatePath("/posts");
  revalidatePath("/queue");
  revalidatePath("/calendar");
  return { success: true, postId: post.id };
}

export async function updatePost(postId: string, formData: FormData) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace" };

  const scheduledAt = formData.get("scheduled_at") as string;

  const { error } = await supabase
    .from("posts")
    .update({
      content: formData.get("content") as string,
      status: formData.get("status") as string,
      scheduled_at: scheduledAt || null,
    })
    .eq("id", postId)
    .eq("workspace_id", workspace.id);

  if (error) return { error: error.message };

  revalidatePath("/posts");
  revalidatePath("/queue");
  revalidatePath("/calendar");
  return { success: true };
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace" };

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("workspace_id", workspace.id);

  if (error) return { error: error.message };

  revalidatePath("/posts");
  revalidatePath("/queue");
  revalidatePath("/calendar");
  return { success: true };
}

export async function submitForApproval(postId: string) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error: updateError } = await supabase
    .from("posts")
    .update({ status: "pending_approval" })
    .eq("id", postId)
    .eq("workspace_id", workspace.id);

  if (updateError) return { error: updateError.message };

  const { error: approvalError } = await supabase
    .from("approval_requests")
    .insert({
      post_id: postId,
      requested_by: user.id,
      status: "pending",
    });

  if (approvalError) return { error: approvalError.message };

  revalidatePath("/posts");
  revalidatePath("/approvals");
  return { success: true };
}

export async function getPost(postId: string) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;

  const { data } = await supabase
    .from("posts")
    .select(
      `
      *,
      post_channels(
        *,
        social_accounts(id, platform, display_name, username, avatar_url)
      ),
      post_media(*, media_assets(*))
    `
    )
    .eq("id", postId)
    .eq("workspace_id", workspace.id)
    .single();

  return data;
}

export async function schedulePost(postId: string, scheduledAt: string) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace" };

  if (!scheduledAt) return { error: "予約日時を指定してください" };

  const scheduledDate = new Date(scheduledAt);
  if (scheduledDate <= new Date()) {
    return { error: "予約日時は現在時刻より後に設定してください" };
  }

  const { error } = await supabase
    .from("posts")
    .update({
      status: "scheduled",
      scheduled_at: scheduledDate.toISOString(),
    })
    .eq("id", postId)
    .eq("workspace_id", workspace.id)
    .in("status", ["draft", "approved"]);

  if (error) return { error: error.message };

  revalidatePath("/posts");
  revalidatePath("/queue");
  revalidatePath("/calendar");
  return { success: true };
}

export async function cancelScheduledPost(postId: string) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace" };

  const { error } = await supabase
    .from("posts")
    .update({
      status: "draft",
      scheduled_at: null,
    })
    .eq("id", postId)
    .eq("workspace_id", workspace.id)
    .eq("status", "scheduled");

  if (error) return { error: error.message };

  revalidatePath("/posts");
  revalidatePath("/queue");
  revalidatePath("/calendar");
  return { success: true };
}

export async function duplicatePost(postId: string) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Fetch original post
  const { data: original } = await supabase
    .from("posts")
    .select("content, post_channels(social_account_id, content_override)")
    .eq("id", postId)
    .eq("workspace_id", workspace.id)
    .single();

  if (!original) return { error: "Post not found" };

  // Create duplicate as draft
  const { data: newPost, error: postError } = await supabase
    .from("posts")
    .insert({
      workspace_id: workspace.id,
      created_by: user.id,
      content: original.content,
      status: "draft",
    })
    .select()
    .single();

  if (postError) return { error: postError.message };

  // Duplicate channel assignments
  if (original.post_channels && original.post_channels.length > 0) {
    const channels = original.post_channels.map(
      (ch: { social_account_id: string; content_override: string | null }) => ({
        post_id: newPost.id,
        social_account_id: ch.social_account_id,
        content_override: ch.content_override,
        status: "pending" as const,
      })
    );

    await supabase.from("post_channels").insert(channels);
  }

  revalidatePath("/posts");
  revalidatePath("/queue");
  return { success: true, postId: newPost.id };
}

export async function getApprovals() {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return [];

  const { data } = await supabase
    .from("approval_requests")
    .select(
      `
      *,
      posts(
        id, content, created_at,
        post_channels(
          *,
          social_accounts(id, platform, display_name)
        )
      )
    `
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // Filter to workspace posts (RLS should handle but be defensive)
  return (data ?? []).filter(
    (a) => a.posts && (a.posts as { id: string }).id
  );
}

export async function reviewApproval(
  approvalId: string,
  action: "approved" | "rejected",
  comment?: string
) {
  const supabase = await createClient();
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "No workspace" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: approval, error: fetchError } = await supabase
    .from("approval_requests")
    .select("post_id")
    .eq("id", approvalId)
    .single();

  if (fetchError) return { error: fetchError.message };

  const { error: reviewError } = await supabase
    .from("approval_requests")
    .update({
      status: action,
      reviewed_by: user.id,
      comment: comment || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", approvalId);

  if (reviewError) return { error: reviewError.message };

  const postStatus = action === "approved" ? "approved" : "draft";
  await supabase
    .from("posts")
    .update({ status: postStatus })
    .eq("id", approval.post_id);

  revalidatePath("/approvals");
  revalidatePath("/posts");
  return { success: true };
}
