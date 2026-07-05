import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/app/actions/workspace";

// Platform-specific OAuth configuration
// In production, these would come from environment variables
const PLATFORM_CONFIG: Record<
  string,
  { authUrl: string; scopes: string[] }
> = {
  twitter: {
    authUrl: "https://twitter.com/i/oauth2/authorize",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
  },
  instagram: {
    authUrl: "https://api.instagram.com/oauth/authorize",
    scopes: ["instagram_basic", "instagram_content_publish"],
  },
  linkedin: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    scopes: ["r_liteprofile", "w_member_social"],
  },
  facebook: {
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    scopes: ["pages_manage_posts", "pages_read_engagement"],
  },
  bluesky: {
    authUrl: "", // Bluesky uses app passwords, not OAuth
    scopes: [],
  },
  mastodon: {
    authUrl: "", // Instance-specific
    scopes: ["read", "write"],
  },
  threads: {
    authUrl: "https://www.threads.net/oauth/authorize",
    scopes: ["threads_basic", "threads_content_publish"],
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const config = PLATFORM_CONFIG[platform];
  if (!config) {
    return NextResponse.json(
      { error: `Unsupported platform: ${platform}` },
      { status: 400 }
    );
  }

  // For platforms that don't use OAuth (like Bluesky with app passwords),
  // redirect to a settings page where they can enter credentials
  if (!config.authUrl) {
    return NextResponse.redirect(
      new URL(
        `/settings/accounts?connect=${platform}&method=credentials`,
        request.url
      )
    );
  }

  // Build OAuth authorization URL
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/connect/${platform}/callback`;
  const state = Buffer.from(
    JSON.stringify({ workspace_id: workspace.id, user_id: user.id })
  ).toString("base64url");

  const authUrl = new URL(config.authUrl);
  authUrl.searchParams.set("client_id", process.env[`${platform.toUpperCase()}_CLIENT_ID`] ?? "");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", config.scopes.join(" "));
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
