import { describe, it, expect } from "vitest";
import {
  signInSchema,
  signUpSchema,
  resetPasswordSchema,
  createPostSchema,
  updatePostSchema,
  schedulePostSchema,
  getPostsOptionsSchema,
  getScheduledPostsSchema,
  reviewApprovalSchema,
  connectAccountSchema,
  updateAccountTokensSchema,
  createTemplateSchema,
  updateTemplateSchema,
  updateWorkspaceSettingsSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  analyticsDateRangeSchema,
  getAccountAnalyticsSchema,
  platformType,
  postStatus,
  workspaceRole,
} from "@/lib/validations";

// ─── Helper ──────────────────────────────────────────────────────

const validUUID = "550e8400-e29b-41d4-a716-446655440000";
const futureISO = new Date(Date.now() + 86400000).toISOString(); // +1 day
const pastISO = new Date(Date.now() - 86400000).toISOString(); // -1 day

function expectFail(schema: { safeParse: (v: unknown) => { success: boolean; error?: { issues: { message: string }[] } } }, input: unknown, messagePart?: string) {
  const result = schema.safeParse(input);
  expect(result.success).toBe(false);
  if (messagePart && !result.success) {
    const messages = result.error!.issues.map((i) => i.message).join(" ");
    expect(messages).toContain(messagePart);
  }
}

function expectPass(schema: { safeParse: (v: unknown) => { success: boolean } }, input: unknown) {
  const result = schema.safeParse(input);
  expect(result.success).toBe(true);
}

// ─── Auth: signInSchema ──────────────────────────────────────────

describe("signInSchema", () => {
  it("accepts valid email and password", () => {
    expectPass(signInSchema, { email: "user@example.com", password: "secret123" });
  });

  it("rejects missing email", () => {
    expectFail(signInSchema, { email: "", password: "secret123" }, "メールアドレスは必須です");
  });

  it("rejects invalid email format", () => {
    expectFail(signInSchema, { email: "not-an-email", password: "secret123" }, "有効なメールアドレス");
  });

  it("rejects missing password", () => {
    expectFail(signInSchema, { email: "user@example.com", password: "" }, "パスワードは必須です");
  });

  it("rejects completely empty object", () => {
    expectFail(signInSchema, {});
  });

  it("rejects email with spaces only", () => {
    expectFail(signInSchema, { email: "   ", password: "abc" }, "メールアドレス");
  });
});

// ─── Auth: signUpSchema ──────────────────────────────────────────

describe("signUpSchema", () => {
  const valid = { email: "new@example.com", password: "Abcdef1!", full_name: "Test User" };

  it("accepts valid signup data", () => {
    expectPass(signUpSchema, valid);
  });

  it("rejects password shorter than 8 chars", () => {
    expectFail(signUpSchema, { ...valid, password: "Ab1" }, "8文字以上");
  });

  it("rejects password without uppercase", () => {
    expectFail(signUpSchema, { ...valid, password: "abcdefg1" }, "大文字");
  });

  it("rejects password without lowercase", () => {
    expectFail(signUpSchema, { ...valid, password: "ABCDEFG1" }, "小文字");
  });

  it("rejects password without digit", () => {
    expectFail(signUpSchema, { ...valid, password: "Abcdefgh" }, "数字");
  });

  it("rejects empty full_name", () => {
    expectFail(signUpSchema, { ...valid, full_name: "" }, "氏名は必須です");
  });

  it("rejects full_name over 100 characters", () => {
    expectFail(signUpSchema, { ...valid, full_name: "A".repeat(101) }, "100文字以内");
  });

  it("accepts full_name exactly 100 characters", () => {
    expectPass(signUpSchema, { ...valid, full_name: "A".repeat(100) });
  });

  it("rejects invalid email", () => {
    expectFail(signUpSchema, { ...valid, email: "bademail" }, "有効なメールアドレス");
  });
});

// ─── Auth: resetPasswordSchema ───────────────────────────────────

describe("resetPasswordSchema", () => {
  it("accepts valid email", () => {
    expectPass(resetPasswordSchema, { email: "reset@example.com" });
  });

  it("rejects empty email", () => {
    expectFail(resetPasswordSchema, { email: "" }, "メールアドレスは必須です");
  });

  it("rejects invalid email", () => {
    expectFail(resetPasswordSchema, { email: "bad" }, "有効なメールアドレス");
  });
});

// ─── Posts: postStatus ───────────────────────────────────────────

describe("postStatus", () => {
  it.each(["draft", "scheduled", "pending_approval", "approved", "published", "failed"])("accepts '%s'", (s) => {
    expectPass(postStatus, s);
  });

  it("rejects unknown status", () => {
    expectFail(postStatus, "deleted", "無効なステータス");
  });

  it("rejects empty string", () => {
    expectFail(postStatus, "");
  });
});

// ─── Posts: createPostSchema ─────────────────────────────────────

describe("createPostSchema", () => {
  it("accepts minimal valid post (draft)", () => {
    expectPass(createPostSchema, { content: "Hello world" });
  });

  it("accepts post with all fields", () => {
    expectPass(createPostSchema, {
      content: "Full post",
      status: "draft",
      scheduled_at: null,
      channel_ids: [validUUID],
      channel_overrides: { [validUUID]: "Override text" },
    });
  });

  it("rejects empty content", () => {
    expectFail(createPostSchema, { content: "" }, "投稿内容は必須です");
  });

  it("rejects whitespace-only content", () => {
    expectFail(createPostSchema, { content: "   " }, "投稿内容は必須です");
  });

  it("defaults status to draft when omitted", () => {
    const result = createPostSchema.safeParse({ content: "Test" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("draft");
    }
  });

  it("defaults channel_ids to empty array", () => {
    const result = createPostSchema.safeParse({ content: "Test" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.channel_ids).toEqual([]);
    }
  });

  it("rejects scheduled status without scheduled_at", () => {
    expectFail(createPostSchema, { content: "Test", status: "scheduled" }, "予約投稿には未来の日時を指定してください");
  });

  it("rejects scheduled status with past scheduled_at", () => {
    expectFail(createPostSchema, { content: "Test", status: "scheduled", scheduled_at: pastISO }, "予約投稿には未来の日時を指定してください");
  });

  it("accepts scheduled status with future scheduled_at", () => {
    expectPass(createPostSchema, { content: "Test", status: "scheduled", scheduled_at: futureISO });
  });

  it("rejects invalid UUID in channel_ids", () => {
    expectFail(createPostSchema, { content: "Test", channel_ids: ["not-a-uuid"] }, "UUID");
  });

  it("accepts multiple valid channel_ids", () => {
    expectPass(createPostSchema, {
      content: "Test",
      channel_ids: [validUUID, "660e8400-e29b-41d4-a716-446655440000"],
    });
  });
});

// ─── Posts: updatePostSchema ─────────────────────────────────────

describe("updatePostSchema", () => {
  it("accepts valid update", () => {
    expectPass(updatePostSchema, { content: "Updated", status: "draft" });
  });

  it("rejects empty content", () => {
    expectFail(updatePostSchema, { content: "", status: "draft" }, "投稿内容は必須です");
  });

  it("rejects invalid status", () => {
    expectFail(updatePostSchema, { content: "Ok", status: "unknown" }, "無効なステータス");
  });

  it("accepts all valid statuses", () => {
    for (const s of ["draft", "scheduled", "pending_approval", "approved", "published", "failed"]) {
      expectPass(updatePostSchema, { content: "x", status: s });
    }
  });

  it("accepts null scheduled_at", () => {
    expectPass(updatePostSchema, { content: "x", status: "draft", scheduled_at: null });
  });
});

// ─── Posts: schedulePostSchema ───────────────────────────────────

describe("schedulePostSchema", () => {
  it("accepts valid postId and future datetime", () => {
    expectPass(schedulePostSchema, { postId: validUUID, scheduled_at: futureISO });
  });

  it("rejects invalid UUID for postId", () => {
    expectFail(schedulePostSchema, { postId: "bad", scheduled_at: futureISO }, "UUID");
  });

  it("rejects past datetime", () => {
    expectFail(schedulePostSchema, { postId: validUUID, scheduled_at: pastISO }, "現在時刻より後");
  });

  it("rejects non-ISO string for scheduled_at", () => {
    expectFail(schedulePostSchema, { postId: validUUID, scheduled_at: "not-a-date" });
  });
});

// ─── Posts: getPostsOptionsSchema ────────────────────────────────

describe("getPostsOptionsSchema", () => {
  it("accepts empty object (all optional)", () => {
    expectPass(getPostsOptionsSchema, {});
  });

  it("accepts valid status filter", () => {
    expectPass(getPostsOptionsSchema, { status: "draft" });
  });

  it("accepts limit and offset", () => {
    expectPass(getPostsOptionsSchema, { limit: 20, offset: 0 });
  });

  it("rejects limit < 1", () => {
    expectFail(getPostsOptionsSchema, { limit: 0 }, "1以上");
  });

  it("rejects limit > 100", () => {
    expectFail(getPostsOptionsSchema, { limit: 101 }, "100以下");
  });

  it("rejects negative offset", () => {
    expectFail(getPostsOptionsSchema, { offset: -1 }, "0以上");
  });

  it("rejects float limit", () => {
    expectFail(getPostsOptionsSchema, { limit: 10.5 }, "整数");
  });

  it("accepts boundary limit=1", () => {
    expectPass(getPostsOptionsSchema, { limit: 1 });
  });

  it("accepts boundary limit=100", () => {
    expectPass(getPostsOptionsSchema, { limit: 100 });
  });
});

// ─── Posts: getScheduledPostsSchema ──────────────────────────────

describe("getScheduledPostsSchema", () => {
  it("accepts valid date range", () => {
    expectPass(getScheduledPostsSchema, { start: pastISO, end: futureISO });
  });

  it("rejects invalid start date", () => {
    expectFail(getScheduledPostsSchema, { start: "nope", end: futureISO });
  });

  it("rejects invalid end date", () => {
    expectFail(getScheduledPostsSchema, { start: pastISO, end: "nope" });
  });
});

// ─── Posts: reviewApprovalSchema ─────────────────────────────────

describe("reviewApprovalSchema", () => {
  it("accepts approved with comment", () => {
    expectPass(reviewApprovalSchema, { approvalId: validUUID, action: "approved", comment: "LGTM" });
  });

  it("accepts rejected without comment", () => {
    expectPass(reviewApprovalSchema, { approvalId: validUUID, action: "rejected" });
  });

  it("rejects invalid action", () => {
    expectFail(reviewApprovalSchema, { approvalId: validUUID, action: "pending" }, "承認または却下");
  });

  it("rejects invalid UUID", () => {
    expectFail(reviewApprovalSchema, { approvalId: "bad", action: "approved" }, "UUID");
  });

  it("rejects comment over 1000 chars", () => {
    expectFail(reviewApprovalSchema, { approvalId: validUUID, action: "approved", comment: "x".repeat(1001) }, "1000文字以内");
  });

  it("accepts comment exactly 1000 chars", () => {
    expectPass(reviewApprovalSchema, { approvalId: validUUID, action: "approved", comment: "x".repeat(1000) });
  });
});

// ─── Social Accounts: platformType ───────────────────────────────

describe("platformType", () => {
  it.each(["twitter", "instagram", "facebook", "linkedin", "tiktok", "threads", "bluesky", "youtube"])(
    "accepts '%s'",
    (p) => {
      expectPass(platformType, p);
    }
  );

  it("rejects unknown platform", () => {
    expectFail(platformType, "mastodon", "サポートされていないプラットフォーム");
  });

  it("rejects empty string", () => {
    expectFail(platformType, "");
  });
});

// ─── Social Accounts: connectAccountSchema ───────────────────────

describe("connectAccountSchema", () => {
  const valid = {
    platform: "twitter",
    platform_user_id: "12345",
    display_name: "Test Account",
    access_token: "tok_abc123",
  };

  it("accepts minimal valid input", () => {
    expectPass(connectAccountSchema, valid);
  });

  it("accepts with all optional fields", () => {
    expectPass(connectAccountSchema, {
      ...valid,
      username: "testuser",
      avatar_url: "https://example.com/avatar.png",
      refresh_token: "ref_xyz",
      token_expires_at: futureISO,
    });
  });

  it("rejects empty platform_user_id", () => {
    expectFail(connectAccountSchema, { ...valid, platform_user_id: "" }, "プラットフォームユーザーID");
  });

  it("rejects empty display_name", () => {
    expectFail(connectAccountSchema, { ...valid, display_name: "" }, "表示名");
  });

  it("rejects empty access_token", () => {
    expectFail(connectAccountSchema, { ...valid, access_token: "" }, "アクセストークン");
  });

  it("rejects invalid platform", () => {
    expectFail(connectAccountSchema, { ...valid, platform: "myspace" }, "サポートされていないプラットフォーム");
  });

  it("rejects invalid avatar_url (not URL)", () => {
    expectFail(connectAccountSchema, { ...valid, avatar_url: "not-a-url" }, "有効なURL");
  });

  it("accepts empty string avatar_url", () => {
    expectPass(connectAccountSchema, { ...valid, avatar_url: "" });
  });

  it("rejects invalid token_expires_at", () => {
    expectFail(connectAccountSchema, { ...valid, token_expires_at: "garbage" });
  });
});

// ─── Social Accounts: updateAccountTokensSchema ──────────────────

describe("updateAccountTokensSchema", () => {
  it("accepts valid tokens", () => {
    expectPass(updateAccountTokensSchema, { accountId: validUUID, access_token: "new_tok" });
  });

  it("accepts with optional fields", () => {
    expectPass(updateAccountTokensSchema, {
      accountId: validUUID,
      access_token: "new_tok",
      refresh_token: "ref",
      expires_at: futureISO,
    });
  });

  it("rejects invalid accountId", () => {
    expectFail(updateAccountTokensSchema, { accountId: "bad", access_token: "tok" }, "UUID");
  });

  it("rejects empty access_token", () => {
    expectFail(updateAccountTokensSchema, { accountId: validUUID, access_token: "" }, "アクセストークン");
  });
});

// ─── Templates: createTemplateSchema ─────────────────────────────

describe("createTemplateSchema", () => {
  it("accepts valid template", () => {
    expectPass(createTemplateSchema, { name: "Promo", content: "Check out {{product}}!" });
  });

  it("accepts with platforms", () => {
    expectPass(createTemplateSchema, { name: "Promo", content: "Content", platforms: ["twitter", "instagram"] });
  });

  it("rejects empty name", () => {
    expectFail(createTemplateSchema, { name: "", content: "Content" }, "テンプレート名は必須です");
  });

  it("rejects empty content", () => {
    expectFail(createTemplateSchema, { name: "Name", content: "" }, "テンプレート内容は必須です");
  });

  it("rejects whitespace-only name", () => {
    expectFail(createTemplateSchema, { name: "   ", content: "Content" }, "テンプレート名は必須です");
  });

  it("rejects name over 200 characters", () => {
    expectFail(createTemplateSchema, { name: "A".repeat(201), content: "Content" }, "200文字以内");
  });

  it("accepts name exactly 200 characters", () => {
    expectPass(createTemplateSchema, { name: "A".repeat(200), content: "Content" });
  });

  it("rejects content over 10000 characters", () => {
    expectFail(createTemplateSchema, { name: "Name", content: "A".repeat(10001) }, "10000文字以内");
  });

  it("accepts content exactly 10000 characters", () => {
    expectPass(createTemplateSchema, { name: "Name", content: "A".repeat(10000) });
  });

  it("rejects invalid platform in platforms array", () => {
    expectFail(createTemplateSchema, { name: "Name", content: "C", platforms: ["snapchat"] }, "サポートされていないプラットフォーム");
  });

  it("defaults platforms to empty array", () => {
    const result = createTemplateSchema.safeParse({ name: "N", content: "C" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.platforms).toEqual([]);
    }
  });
});

// ─── Templates: updateTemplateSchema ─────────────────────────────

describe("updateTemplateSchema", () => {
  it("accepts empty object (all optional)", () => {
    expectPass(updateTemplateSchema, {});
  });

  it("accepts partial update with name only", () => {
    expectPass(updateTemplateSchema, { name: "New Name" });
  });

  it("accepts partial update with content only", () => {
    expectPass(updateTemplateSchema, { content: "New content" });
  });

  it("accepts partial update with platforms only", () => {
    expectPass(updateTemplateSchema, { platforms: ["twitter"] });
  });

  it("rejects name over 200 characters", () => {
    expectFail(updateTemplateSchema, { name: "A".repeat(201) }, "200文字以内");
  });

  it("rejects content over 10000 characters", () => {
    expectFail(updateTemplateSchema, { content: "A".repeat(10001) }, "10000文字以内");
  });

  it("rejects invalid platform", () => {
    expectFail(updateTemplateSchema, { platforms: ["vine"] }, "サポートされていないプラットフォーム");
  });
});

// ─── Workspace: workspaceRole ────────────────────────────────────

describe("workspaceRole", () => {
  it.each(["admin", "editor", "viewer"])("accepts '%s'", (r) => {
    expectPass(workspaceRole, r);
  });

  it("rejects unknown role", () => {
    expectFail(workspaceRole, "superadmin", "無効な権限");
  });
});

// ─── Workspace: updateWorkspaceSettingsSchema ────────────────────

describe("updateWorkspaceSettingsSchema", () => {
  const valid = { name: "My Workspace", timezone: "Asia/Tokyo" };

  it("accepts valid settings", () => {
    expectPass(updateWorkspaceSettingsSchema, valid);
  });

  it("accepts with optional ai fields", () => {
    expectPass(updateWorkspaceSettingsSchema, { ...valid, ai_provider: "openai", ai_api_key: "sk-xxx" });
  });

  it("rejects empty workspace name", () => {
    expectFail(updateWorkspaceSettingsSchema, { ...valid, name: "" }, "ワークスペース名は必須です");
  });

  it("rejects whitespace-only workspace name", () => {
    expectFail(updateWorkspaceSettingsSchema, { ...valid, name: "   " }, "ワークスペース名は必須です");
  });

  it("rejects name over 100 characters", () => {
    expectFail(updateWorkspaceSettingsSchema, { ...valid, name: "W".repeat(101) }, "100文字以内");
  });

  it("accepts name exactly 100 characters", () => {
    expectPass(updateWorkspaceSettingsSchema, { ...valid, name: "W".repeat(100) });
  });

  it("rejects empty timezone", () => {
    expectFail(updateWorkspaceSettingsSchema, { ...valid, timezone: "" }, "タイムゾーンは必須です");
  });

  it("rejects invalid ai_provider", () => {
    expectFail(updateWorkspaceSettingsSchema, { ...valid, ai_provider: "llama" });
  });

  it("accepts all valid ai_providers", () => {
    for (const p of ["openai", "anthropic", "google"]) {
      expectPass(updateWorkspaceSettingsSchema, { ...valid, ai_provider: p });
    }
  });
});

// ─── Workspace: inviteMemberSchema ───────────────────────────────

describe("inviteMemberSchema", () => {
  it("accepts valid invite", () => {
    expectPass(inviteMemberSchema, { email: "invite@example.com", role: "editor" });
  });

  it("rejects invalid email", () => {
    expectFail(inviteMemberSchema, { email: "bad", role: "editor" }, "有効なメールアドレス");
  });

  it("rejects empty email", () => {
    expectFail(inviteMemberSchema, { email: "", role: "viewer" }, "メールアドレスは必須です");
  });

  it("rejects invalid role", () => {
    expectFail(inviteMemberSchema, { email: "a@b.com", role: "owner" }, "無効な権限");
  });

  it("accepts all valid roles", () => {
    for (const r of ["admin", "editor", "viewer"]) {
      expectPass(inviteMemberSchema, { email: "a@b.com", role: r });
    }
  });
});

// ─── Workspace: updateMemberRoleSchema ───────────────────────────

describe("updateMemberRoleSchema", () => {
  it("accepts valid update", () => {
    expectPass(updateMemberRoleSchema, { memberId: validUUID, role: "admin" });
  });

  it("rejects invalid memberId", () => {
    expectFail(updateMemberRoleSchema, { memberId: "xyz", role: "admin" }, "UUID");
  });

  it("rejects invalid role", () => {
    expectFail(updateMemberRoleSchema, { memberId: validUUID, role: "moderator" }, "無効な権限");
  });
});

// ─── Analytics: analyticsDateRangeSchema ─────────────────────────

describe("analyticsDateRangeSchema", () => {
  it("accepts valid days", () => {
    expectPass(analyticsDateRangeSchema, { days: 30 });
  });

  it("defaults to 30 days when omitted", () => {
    const result = analyticsDateRangeSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.days).toBe(30);
    }
  });

  it("rejects days < 1", () => {
    expectFail(analyticsDateRangeSchema, { days: 0 }, "1以上");
  });

  it("rejects days > 365", () => {
    expectFail(analyticsDateRangeSchema, { days: 366 }, "365以下");
  });

  it("rejects float days", () => {
    expectFail(analyticsDateRangeSchema, { days: 30.5 }, "整数");
  });

  it("accepts boundary days=1", () => {
    expectPass(analyticsDateRangeSchema, { days: 1 });
  });

  it("accepts boundary days=365", () => {
    expectPass(analyticsDateRangeSchema, { days: 365 });
  });
});

// ─── Analytics: getAccountAnalyticsSchema ────────────────────────

describe("getAccountAnalyticsSchema", () => {
  it("accepts valid input", () => {
    expectPass(getAccountAnalyticsSchema, { accountId: validUUID, days: 7 });
  });

  it("defaults days to 30", () => {
    const result = getAccountAnalyticsSchema.safeParse({ accountId: validUUID });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.days).toBe(30);
    }
  });

  it("rejects invalid accountId", () => {
    expectFail(getAccountAnalyticsSchema, { accountId: "not-uuid" }, "UUID");
  });

  it("rejects days out of range", () => {
    expectFail(getAccountAnalyticsSchema, { accountId: validUUID, days: 0 }, "1以上");
    expectFail(getAccountAnalyticsSchema, { accountId: validUUID, days: 500 }, "365以下");
  });
});

// ─── Cross-cutting: Japanese error messages ──────────────────────

describe("Japanese error messages", () => {
  it("signIn email error is in Japanese", () => {
    const result = signInSchema.safeParse({ email: "", password: "x" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/メールアドレス/);
    }
  });

  it("createPost content error is in Japanese", () => {
    const result = createPostSchema.safeParse({ content: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/投稿内容/);
    }
  });

  it("workspace name error is in Japanese", () => {
    const result = updateWorkspaceSettingsSchema.safeParse({ name: "", timezone: "UTC" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/ワークスペース名/);
    }
  });

  it("template name error is in Japanese", () => {
    const result = createTemplateSchema.safeParse({ name: "", content: "x" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/テンプレート名/);
    }
  });

  it("platform error is in Japanese", () => {
    const result = platformType.safeParse("unknown");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/プラットフォーム/);
    }
  });

  it("role error is in Japanese", () => {
    const result = workspaceRole.safeParse("badrole");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/権限/);
    }
  });
});

// ─── Edge cases: type coercion & unexpected inputs ───────────────

describe("edge cases", () => {
  it("signInSchema rejects number as email", () => {
    expectFail(signInSchema, { email: 123, password: "abc" });
  });

  it("createPostSchema rejects array as content", () => {
    expectFail(createPostSchema, { content: ["hello"] });
  });

  it("getPostsOptionsSchema rejects string as limit", () => {
    expectFail(getPostsOptionsSchema, { limit: "ten" });
  });

  it("analyticsDateRangeSchema rejects negative days", () => {
    expectFail(analyticsDateRangeSchema, { days: -5 }, "1以上");
  });

  it("connectAccountSchema rejects null platform", () => {
    expectFail(connectAccountSchema, {
      platform: null,
      platform_user_id: "1",
      display_name: "D",
      access_token: "t",
    });
  });

  it("updateMemberRoleSchema rejects empty string role", () => {
    expectFail(updateMemberRoleSchema, { memberId: validUUID, role: "" }, "無効な権限");
  });

  it("createTemplateSchema trims name whitespace", () => {
    const result = createTemplateSchema.safeParse({ name: "  Hello  ", content: "Content" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Hello");
    }
  });

  it("schedulePostSchema rejects Date object (expects string)", () => {
    expectFail(schedulePostSchema, { postId: validUUID, scheduled_at: new Date() });
  });
});
