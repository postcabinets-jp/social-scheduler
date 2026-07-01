-- SEED DATA for social-scheduler
-- Realistic sample data for demonstration purposes

-- NOTE: In production, users are created via Supabase Auth.
-- This seed creates demo data for development environments.
-- Run AFTER creating users through the auth API.

-- Demo workspace (replace UUIDs after creating actual users)
-- These are placeholder UUIDs for documentation / local dev with auth mock

-- Sample post templates
-- (workspace_id must match an actual workspace after user signup)

-- Social media post ideas for content calendar demo
-- These SQL comments document what seed.sql should look like in a live env:

/*
DEMO DATA STRUCTURE:

Workspace: "Nakamura Digital Agency"
Owner: Kenji Nakamura (kenji@nakamura-digital.co.jp)
Members:
  - Kenji Nakamura (admin)
  - Yuki Tanaka (editor) - content creator
  - Mia Sato (viewer) - client observer

Social Accounts:
  - @nakamura_digital (Twitter/X) - 12,400 followers
  - nakamura.digital (Instagram) - 8,900 followers
  - Nakamura Digital (LinkedIn Company) - 3,200 followers
  - nakamuradigital (Bluesky) - 1,100 followers

Posts:
  - "Webマーケティングの新常識: オーガニック vs 有料広告の ROI 比較 [2026年版]" (Published, Twitter+LinkedIn)
  - "EC売上を30%上げた5つのInstagram施策【実績付き】" (Scheduled, Instagram)
  - "月商2,000万円のD2Cブランドが実践するSNS戦略" (Draft, all channels)
  - "Google Analytics 4 完全移行ガイド：UA時代の設定を完全再現する方法" (Pending approval)

Analytics:
  - Twitter: 45,200 impressions last 30 days, 3.2% engagement rate
  - Instagram: 28,100 reach, 5.8% engagement rate
  - LinkedIn: 12,400 impressions, 4.1% engagement rate

Templates:
  - 週次レポート定型文
  - キャンペーン告知テンプレ
  - 採用告知テンプレ
*/

-- The actual seed is injected via the application's onboarding flow
-- or can be run with supabase db seed after creating demo users.
SELECT 'Seed file loaded. Create demo users via Supabase Auth dashboard or CLI first.' as info;
