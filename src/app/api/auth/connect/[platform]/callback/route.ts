import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth callback handler for social account connections
// Each platform has different token exchange and profile fetch APIs

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL(
        `/settings/accounts?error=${error || "no_code"}&platform=${platform}`,
        request.url
      )
    );
  }

  // Decode state to get workspace/user info
  let stateData: { workspace_id: string; user_id: string } | null = null;
  if (state) {
    try {
      stateData = JSON.parse(Buffer.from(state, "base64url").toString());
    } catch {
      return NextResponse.redirect(
        new URL(
          `/settings/accounts?error=invalid_state&platform=${platform}`,
          request.url
        )
      );
    }
  }

  if (!stateData) {
    return NextResponse.redirect(
      new URL(
        `/settings/accounts?error=missing_state&platform=${platform}`,
        request.url
      )
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== stateData.user_id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Exchange code for tokens
  // In production, each platform has different endpoints and response formats
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/connect/${platform}/callback`;
  const clientId = process.env[`${platform.toUpperCase()}_CLIENT_ID`] ?? "";
  const clientSecret =
    process.env[`${platform.toUpperCase()}_CLIENT_SECRET`] ?? "";

  try {
    let accessToken = "";
    let refreshToken = "";
    let expiresAt: string | null = null;
    let platformUserId = "";
    let displayName = "";
    let username = "";
    let avatarUrl = "";

    // Platform-specific token exchange
    if (platform === "twitter") {
      const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code_verifier: "challenge", // In production, use PKCE
        }),
      });
      const tokenData = await tokenRes.json();
      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token ?? "";
      if (tokenData.expires_in) {
        expiresAt = new Date(
          Date.now() + tokenData.expires_in * 1000
        ).toISOString();
      }

      // Fetch user profile
      const profileRes = await fetch(
        "https://api.twitter.com/2/users/me?user.fields=profile_image_url",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const profileData = await profileRes.json();
      platformUserId = profileData.data?.id ?? "";
      displayName = profileData.data?.name ?? "";
      username = profileData.data?.username ?? "";
      avatarUrl = profileData.data?.profile_image_url ?? "";
    } else {
      // Generic OAuth2 token exchange for other platforms
      const tokenRes = await fetch(getTokenEndpoint(platform), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      });
      const tokenData = await tokenRes.json();
      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token ?? "";
      if (tokenData.expires_in) {
        expiresAt = new Date(
          Date.now() + tokenData.expires_in * 1000
        ).toISOString();
      }
      platformUserId = tokenData.user_id ?? `${platform}_${Date.now()}`;
      displayName = tokenData.name ?? platform;
      username = tokenData.username ?? "";
    }

    // Save to database
    const { error: dbError } = await supabase
      .from("social_accounts")
      .upsert(
        {
          workspace_id: stateData.workspace_id,
          platform,
          platform_user_id: platformUserId,
          display_name: displayName,
          username: username || null,
          avatar_url: avatarUrl || null,
          access_token_enc: accessToken,
          refresh_token_enc: refreshToken || null,
          token_expires_at: expiresAt,
          is_active: true,
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: "workspace_id,platform,platform_user_id" }
      );

    if (dbError) {
      return NextResponse.redirect(
        new URL(
          `/settings/accounts?error=db_error&platform=${platform}`,
          request.url
        )
      );
    }

    return NextResponse.redirect(
      new URL(
        `/settings/accounts?success=connected&platform=${platform}`,
        request.url
      )
    );
  } catch {
    return NextResponse.redirect(
      new URL(
        `/settings/accounts?error=token_exchange_failed&platform=${platform}`,
        request.url
      )
    );
  }
}

function getTokenEndpoint(platform: string): string {
  const endpoints: Record<string, string> = {
    instagram: "https://api.instagram.com/oauth/access_token",
    linkedin: "https://www.linkedin.com/oauth/v2/accessToken",
    facebook: "https://graph.facebook.com/v18.0/oauth/access_token",
    threads: "https://graph.threads.net/oauth/access_token",
  };
  return endpoints[platform] ?? "";
}
