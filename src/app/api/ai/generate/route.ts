import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/app/actions/workspace";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workspace = await getCurrentWorkspace();
  if (!workspace?.ai_provider || !workspace?.ai_api_key_enc) {
    return NextResponse.json(
      { error: "AI APIキーが設定されていません。ワークスペース設定でAPIキーを追加してください。" },
      { status: 400 }
    );
  }

  const { prompt } = await request.json();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const systemPrompt = `あなたはSNSマーケティングの専門家です。
与えられたプロンプトに基づいて、エンゲージメントが高いSNS投稿文を生成してください。
- 自然で人間らしい文体で書いてください
- 過度な絵文字は避けてください（0〜2個が適切）
- ハッシュタグは最後に3〜5個まで
- 280文字以内を目安に（プラットフォームに応じて調整）
- 投稿文のみを返してください（説明や前置きは不要）`;

  try {
    let content = "";

    if (workspace.ai_provider === "openai") {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${workspace.ai_api_key_enc}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          max_tokens: 500,
        }),
      });
      const data = await response.json();
      content = data.choices?.[0]?.message?.content ?? "";
    } else if (workspace.ai_provider === "anthropic") {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": workspace.ai_api_key_enc,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 500,
          system: systemPrompt,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      content = data.content?.[0]?.text ?? "";
    } else if (workspace.ai_provider === "groq") {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${workspace.ai_api_key_enc}`,
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt },
            ],
            max_tokens: 500,
          }),
        }
      );
      const data = await response.json();
      content = data.choices?.[0]?.message?.content ?? "";
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json({ error: "AI生成に失敗しました" }, { status: 500 });
  }
}
