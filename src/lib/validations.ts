import { z } from "zod";

// ─── 共通バリデーション ───────────────────────────────────────────

const uuid = z
  .string()
  .uuid({ message: "有効なUUID形式で入力してください" });

const isoDatetime = z
  .string()
  .refine(
    (v) => !isNaN(Date.parse(v)),
    { message: "有効なISO 8601日時形式で入力してください" }
  );

const futureDatetime = z
  .string()
  .refine(
    (v) => !isNaN(Date.parse(v)) && new Date(v) > new Date(),
    { message: "予約日時は現在時刻より後に設定してください" }
  );

const nonEmptyString = (field: string) =>
  z
    .string()
    .min(1, { message: `${field}は必須です` })
    .transform((v) => v.trim())
    .pipe(z.string().min(1, { message: `${field}は必須です` }));

// ─── Auth ─────────────────────────────────────────────────────────

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: "メールアドレスは必須です" })
    .email({ message: "有効なメールアドレスを入力してください" }),
  password: z
    .string()
    .min(1, { message: "パスワードは必須です" }),
});

export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, { message: "メールアドレスは必須です" })
    .email({ message: "有効なメールアドレスを入力してください" }),
  password: z
    .string()
    .min(8, { message: "パスワードは8文字以上で入力してください" })
    .regex(/[A-Z]/, { message: "パスワードには大文字を1文字以上含めてください" })
    .regex(/[a-z]/, { message: "パスワードには小文字を1文字以上含めてください" })
    .regex(/[0-9]/, { message: "パスワードには数字を1文字以上含めてください" }),
  full_name: z
    .string()
    .min(1, { message: "氏名は必須です" })
    .max(100, { message: "氏名は100文字以内で入力してください" }),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "メールアドレスは必須です" })
    .email({ message: "有効なメールアドレスを入力してください" }),
});

// ─── Posts ─────────────────────────────────────────────────────────

export const postStatus = z.enum(
  ["draft", "scheduled", "pending_approval", "approved", "published", "failed"],
  { errorMap: () => ({ message: "無効なステータスです" }) }
);

export const createPostSchema = z
  .object({
    content: nonEmptyString("投稿内容"),
    status: z.enum(["draft", "scheduled", "pending_approval"]).default("draft"),
    scheduled_at: z.string().nullable().optional(),
    channel_ids: z
      .array(uuid)
      .default([]),
    channel_overrides: z
      .record(z.string(), z.string())
      .default({}),
  })
  .refine(
    (data) => {
      if (data.status === "scheduled") {
        return !!data.scheduled_at && new Date(data.scheduled_at) > new Date();
      }
      return true;
    },
    {
      message: "予約投稿には未来の日時を指定してください",
      path: ["scheduled_at"],
    }
  );

export const updatePostSchema = z.object({
  content: nonEmptyString("投稿内容"),
  status: postStatus,
  scheduled_at: z.string().nullable().optional(),
});

export const schedulePostSchema = z.object({
  postId: uuid,
  scheduled_at: futureDatetime,
});

export const getPostsOptionsSchema = z.object({
  status: postStatus.optional(),
  limit: z
    .number()
    .int({ message: "limitは整数で指定してください" })
    .min(1, { message: "limitは1以上で指定してください" })
    .max(100, { message: "limitは100以下で指定してください" })
    .optional(),
  offset: z
    .number()
    .int({ message: "offsetは整数で指定してください" })
    .min(0, { message: "offsetは0以上で指定してください" })
    .optional(),
});

export const getScheduledPostsSchema = z.object({
  start: isoDatetime,
  end: isoDatetime,
});

export const reviewApprovalSchema = z.object({
  approvalId: uuid,
  action: z.enum(["approved", "rejected"], {
    errorMap: () => ({ message: "承認または却下を指定してください" }),
  }),
  comment: z
    .string()
    .max(1000, { message: "コメントは1000文字以内で入力してください" })
    .optional(),
});

// ─── Social Accounts ──────────────────────────────────────────────

export const platformType = z.enum(
  ["twitter", "instagram", "facebook", "linkedin", "tiktok", "threads", "bluesky", "youtube"],
  { errorMap: () => ({ message: "サポートされていないプラットフォームです" }) }
);

export const connectAccountSchema = z.object({
  platform: platformType,
  platform_user_id: nonEmptyString("プラットフォームユーザーID"),
  display_name: nonEmptyString("表示名"),
  access_token: nonEmptyString("アクセストークン"),
  username: z.string().optional(),
  avatar_url: z.string().url({ message: "有効なURLを入力してください" }).optional().or(z.literal("")),
  refresh_token: z.string().optional(),
  token_expires_at: isoDatetime.optional(),
});

export const updateAccountTokensSchema = z.object({
  accountId: uuid,
  access_token: nonEmptyString("アクセストークン"),
  refresh_token: z.string().optional(),
  expires_at: isoDatetime.optional(),
});

// ─── Templates ────────────────────────────────────────────────────

export const createTemplateSchema = z.object({
  name: nonEmptyString("テンプレート名")
    .pipe(z.string().max(200, { message: "テンプレート名は200文字以内で入力してください" })),
  content: nonEmptyString("テンプレート内容")
    .pipe(z.string().max(10000, { message: "テンプレート内容は10000文字以内で入力してください" })),
  platforms: z
    .array(platformType)
    .default([]),
});

export const updateTemplateSchema = z.object({
  name: z.string().max(200, { message: "テンプレート名は200文字以内で入力してください" }).optional(),
  content: z.string().max(10000, { message: "テンプレート内容は10000文字以内で入力してください" }).optional(),
  platforms: z.array(platformType).optional(),
});

// ─── Workspace ────────────────────────────────────────────────────

export const workspaceRole = z.enum(["admin", "editor", "viewer"], {
  errorMap: () => ({ message: "無効な権限です。admin, editor, viewerのいずれかを指定してください" }),
});

export const updateWorkspaceSettingsSchema = z.object({
  name: nonEmptyString("ワークスペース名")
    .pipe(z.string().max(100, { message: "ワークスペース名は100文字以内で入力してください" })),
  timezone: nonEmptyString("タイムゾーン"),
  ai_provider: z.enum(["openai", "anthropic", "google"]).optional(),
  ai_api_key: z.string().optional(),
});

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .min(1, { message: "メールアドレスは必須です" })
    .email({ message: "有効なメールアドレスを入力してください" }),
  role: workspaceRole,
});

export const updateMemberRoleSchema = z.object({
  memberId: uuid,
  role: workspaceRole,
});

// ─── Analytics ────────────────────────────────────────────────────

export const analyticsDateRangeSchema = z.object({
  days: z
    .number()
    .int({ message: "日数は整数で指定してください" })
    .min(1, { message: "日数は1以上で指定してください" })
    .max(365, { message: "日数は365以下で指定してください" })
    .default(30),
});

export const getAccountAnalyticsSchema = z.object({
  accountId: uuid,
  days: z
    .number()
    .int({ message: "日数は整数で指定してください" })
    .min(1, { message: "日数は1以上で指定してください" })
    .max(365, { message: "日数は365以下で指定してください" })
    .default(30),
});

// ─── 型エクスポート ───────────────────────────────────────────────

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type SchedulePostInput = z.infer<typeof schedulePostSchema>;
export type GetPostsOptions = z.infer<typeof getPostsOptionsSchema>;
export type GetScheduledPostsInput = z.infer<typeof getScheduledPostsSchema>;
export type ReviewApprovalInput = z.infer<typeof reviewApprovalSchema>;
export type ConnectAccountInput = z.infer<typeof connectAccountSchema>;
export type UpdateAccountTokensInput = z.infer<typeof updateAccountTokensSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type UpdateWorkspaceSettingsInput = z.infer<typeof updateWorkspaceSettingsSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type AnalyticsDateRange = z.infer<typeof analyticsDateRangeSchema>;
export type GetAccountAnalyticsInput = z.infer<typeof getAccountAnalyticsSchema>;
export type PlatformType = z.infer<typeof platformType>;
export type PostStatus = z.infer<typeof postStatus>;
export type WorkspaceRole = z.infer<typeof workspaceRole>;
