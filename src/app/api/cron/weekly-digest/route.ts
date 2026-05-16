import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { getISOWeek, getISOWeekYear } from '@/lib/score';

// ─── helpers ──────────────────────────────────────────────────────────────────

function tierEmoji(tier: string) {
  switch (tier) {
    case 'founding': return '🏆';
    case 'veteran':  return '⚡';
    case 'builder':  return '🔨';
    default:         return '🌱';
  }
}

function truncate(str: string, max: number) {
  return str.length <= max ? str : str.slice(0, max).trimEnd() + '…';
}

// ─── HTML email template ───────────────────────────────────────────────────────

function buildDigestHtml(data: {
  weekNumber: number;
  year: number;
  topLogs: Array<{
    id: string;
    builder_slug: string;
    builder_name: string;
    shipped: string;
    upvote_count: number;
  }>;
  newBuilders: Array<{ slug: string; display_name: string; building: string | null }>;
  topStreaks: Array<{ slug: string; display_name: string; current_streak: number; tier: string }>;
  openQuests: Array<{ id: string; title: string; category: string; reward_type: string }>;
  totalLogs: number;
  totalBuilders: number;
}) {
  const { weekNumber, year, topLogs, newBuilders, topStreaks, openQuests, totalLogs, totalBuilders } = data;
  const base = 'https://opceo.ai';

  const logsHtml = topLogs.map((log, i) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #1e1e30;vertical-align:top;">
        <span style="font-family:monospace;color:#534AB7;font-size:13px;">#${i + 1}</span>
        &nbsp;
        <a href="${base}/${log.builder_slug}/logs/${log.id}" style="color:#a49ef5;text-decoration:none;font-weight:600;">${log.builder_name}</a>
        <span style="color:#ffffff40;font-size:12px;"> · ${log.upvote_count} ▲</span>
        <br/>
        <span style="color:#ffffffcc;font-size:14px;line-height:1.5;">${truncate(log.shipped, 120)}</span>
      </td>
    </tr>`).join('');

  const newBuildersHtml = newBuilders.map(b => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #1e1e30;">
        <a href="${base}/${b.slug}" style="color:#a49ef5;text-decoration:none;font-weight:600;">${b.display_name}</a>
        ${b.building ? `<span style="color:#ffffff50;font-size:12px;"> · building ${truncate(b.building, 50)}</span>` : ''}
      </td>
    </tr>`).join('');

  const streaksHtml = topStreaks.map((b, i) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #1e1e30;">
        <span style="font-family:monospace;color:#534AB7;font-size:13px;">${tierEmoji(b.tier)}</span>
        &nbsp;
        <a href="${base}/${b.slug}" style="color:#a49ef5;text-decoration:none;font-weight:600;">${b.display_name}</a>
        <span style="color:#38BDF8;font-size:13px;font-family:monospace;"> ${b.current_streak}w streak</span>
      </td>
    </tr>`).join('');

  const questsHtml = openQuests.map(q => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #1e1e30;">
        <a href="${base}/quests/${q.id}" style="color:#a49ef5;text-decoration:none;font-weight:600;">${truncate(q.title, 70)}</a>
        <br/>
        <span style="color:#ffffff40;font-size:12px;">${q.category} · ${q.reward_type}</span>
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OpCEO.AI — Week ${weekNumber} Digest</title>
</head>
<body style="margin:0;padding:0;background:#08080f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08080f;min-height:100vh;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding-bottom:32px;border-bottom:1px solid #1e1e30;">
            <a href="${base}" style="text-decoration:none;">
              <span style="font-family:monospace;font-size:22px;font-weight:500;color:#ffffff;">OpCEO</span><span style="font-family:monospace;font-size:22px;font-weight:500;color:#6B63D9;">.AI</span>
            </a>
            <p style="margin:8px 0 0;color:#ffffff40;font-size:13px;font-family:monospace;">
              Week ${weekNumber} · ${year} · Builder Digest
            </p>
          </td>
        </tr>

        <!-- Stats bar -->
        <tr>
          <td style="padding:24px 0;border-bottom:1px solid #1e1e30;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="text-align:center;">
                  <p style="margin:0;font-size:28px;font-weight:700;font-family:monospace;color:#ffffff;">${totalLogs}</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#ffffff40;text-transform:uppercase;letter-spacing:.08em;">logs shipped</p>
                </td>
                <td style="text-align:center;">
                  <p style="margin:0;font-size:28px;font-weight:700;font-family:monospace;color:#ffffff;">${totalBuilders}</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#ffffff40;text-transform:uppercase;letter-spacing:.08em;">builders</p>
                </td>
                <td style="text-align:center;">
                  <p style="margin:0;font-size:28px;font-weight:700;font-family:monospace;color:#ffffff;">${topStreaks[0]?.current_streak ?? 0}</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#ffffff40;text-transform:uppercase;letter-spacing:.08em;">top streak</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${topLogs.length > 0 ? `
        <!-- Top Ship Logs -->
        <tr>
          <td style="padding-top:32px;">
            <p style="margin:0 0 16px;font-size:11px;font-family:monospace;font-weight:600;color:#ffffff40;text-transform:uppercase;letter-spacing:.12em;">Top Ship Logs This Week</p>
            <table width="100%" cellpadding="0" cellspacing="0">${logsHtml}</table>
          </td>
        </tr>` : ''}

        ${topStreaks.length > 0 ? `
        <!-- Streaks on Fire -->
        <tr>
          <td style="padding-top:32px;">
            <p style="margin:0 0 16px;font-size:11px;font-family:monospace;font-weight:600;color:#ffffff40;text-transform:uppercase;letter-spacing:.12em;">Streaks on Fire 🔥</p>
            <table width="100%" cellpadding="0" cellspacing="0">${streaksHtml}</table>
          </td>
        </tr>` : ''}

        ${newBuilders.length > 0 ? `
        <!-- New Builders -->
        <tr>
          <td style="padding-top:32px;">
            <p style="margin:0 0 16px;font-size:11px;font-family:monospace;font-weight:600;color:#ffffff40;text-transform:uppercase;letter-spacing:.12em;">New Builders This Week</p>
            <table width="100%" cellpadding="0" cellspacing="0">${newBuildersHtml}</table>
          </td>
        </tr>` : ''}

        ${openQuests.length > 0 ? `
        <!-- Open Quests -->
        <tr>
          <td style="padding-top:32px;">
            <p style="margin:0 0 16px;font-size:11px;font-family:monospace;font-weight:600;color:#ffffff40;text-transform:uppercase;letter-spacing:.12em;">Open Quests</p>
            <table width="100%" cellpadding="0" cellspacing="0">${questsHtml}</table>
            <p style="margin:16px 0 0;">
              <a href="${base}/quests" style="color:#38BDF8;text-decoration:none;font-size:13px;">View all quests →</a>
            </p>
          </td>
        </tr>` : ''}

        <!-- CTA -->
        <tr>
          <td style="padding:40px 0 32px;text-align:center;border-top:1px solid #1e1e30;margin-top:32px;">
            <a href="${base}/submit" style="display:inline-block;background:#534AB7;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;">
              Ship your Week ${weekNumber} log →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding-top:16px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#ffffff20;">
              You're receiving this because you joined OpCEO.AI.<br/>
              <a href="${base}/settings" style="color:#ffffff30;text-decoration:underline;">Manage email preferences</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── plain text fallback ───────────────────────────────────────────────────────

function buildDigestText(data: {
  weekNumber: number;
  year: number;
  topLogs: Array<{ id: string; builder_slug: string; builder_name: string; shipped: string; upvote_count: number }>;
  newBuilders: Array<{ slug: string; display_name: string; building: string | null }>;
  topStreaks: Array<{ slug: string; display_name: string; current_streak: number; tier: string }>;
  openQuests: Array<{ id: string; title: string; category: string; reward_type: string }>;
  totalLogs: number;
  totalBuilders: number;
}) {
  const { weekNumber, year, topLogs, newBuilders, topStreaks, openQuests, totalLogs, totalBuilders } = data;
  const base = 'https://opceo.ai';
  const lines: string[] = [
    `OpCEO.AI — Week ${weekNumber} · ${year} Builder Digest`,
    '='.repeat(50),
    '',
    `${totalLogs} logs shipped · ${totalBuilders} builders`,
    '',
  ];

  if (topLogs.length) {
    lines.push('TOP SHIP LOGS THIS WEEK', '-'.repeat(30));
    topLogs.forEach((log, i) => {
      lines.push(`#${i + 1} ${log.builder_name} (${log.upvote_count} ▲)`);
      lines.push(truncate(log.shipped, 140));
      lines.push(`${base}/${log.builder_slug}/logs/${log.id}`);
      lines.push('');
    });
  }

  if (topStreaks.length) {
    lines.push('STREAKS ON FIRE 🔥', '-'.repeat(30));
    topStreaks.forEach(b => lines.push(`${b.display_name} — ${b.current_streak}w streak  ${base}/${b.slug}`));
    lines.push('');
  }

  if (newBuilders.length) {
    lines.push('NEW BUILDERS THIS WEEK', '-'.repeat(30));
    newBuilders.forEach(b => lines.push(`${b.display_name}${b.building ? ` · building ${b.building}` : ''}  ${base}/${b.slug}`));
    lines.push('');
  }

  if (openQuests.length) {
    lines.push('OPEN QUESTS', '-'.repeat(30));
    openQuests.forEach(q => lines.push(`${q.title}  ${base}/quests/${q.id}`));
    lines.push('');
    lines.push(`View all quests: ${base}/quests`);
    lines.push('');
  }

  lines.push(`Ship your Week ${weekNumber} log: ${base}/submit`);
  lines.push('');
  lines.push(`Manage email preferences: ${base}/settings`);

  return lines.join('\n');
}

// ─── route handler ─────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekNumber = getISOWeek(lastWeek);
  const year = getISOWeekYear(lastWeek);

  // ── 1. Top ship logs from last week (by upvotes) ──────────────────────────
  const { data: rawLogs } = await supabase
    .from('ship_logs')
    .select('id, shipped, upvote_count, week_number, year, builders(slug, display_name)')
    .eq('week_number', weekNumber)
    .eq('year', year)
    .order('upvote_count', { ascending: false })
    .limit(5);

  const topLogs = (rawLogs ?? []).map(l => {
    const b = l.builders as unknown as { slug: string; display_name: string } | null;
    return {
      id: l.id as string,
      builder_slug: b?.slug ?? '',
      builder_name: b?.display_name ?? 'Unknown',
      shipped: l.shipped as string,
      upvote_count: (l.upvote_count as number) ?? 0,
    };
  });

  // ── 2. Total logs count (platform-wide, last week) ────────────────────────
  const { count: totalLogs } = await supabase
    .from('ship_logs')
    .select('id', { count: 'exact', head: true })
    .eq('week_number', weekNumber)
    .eq('year', year);

  // ── 3. Total builders ─────────────────────────────────────────────────────
  const { count: totalBuilders } = await supabase
    .from('builders')
    .select('id', { count: 'exact', head: true });

  // ── 4. New builders this week ─────────────────────────────────────────────
  const weekStart = new Date(lastWeek);
  weekStart.setDate(lastWeek.getDate() - lastWeek.getDay() + 1); // Monday
  weekStart.setHours(0, 0, 0, 0);

  const { data: rawNew } = await supabase
    .from('builders')
    .select('slug, display_name, building')
    .gte('created_at', weekStart.toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  const newBuilders = (rawNew ?? []).map(b => ({
    slug: b.slug as string,
    display_name: b.display_name as string,
    building: (b.building as string | null) ?? null,
  }));

  // ── 5. Top streaks ────────────────────────────────────────────────────────
  const { data: rawStreaks } = await supabase
    .from('builders')
    .select('slug, display_name, current_streak, tier')
    .gt('current_streak', 0)
    .order('current_streak', { ascending: false })
    .limit(5);

  const topStreaks = (rawStreaks ?? []).map(b => ({
    slug: b.slug as string,
    display_name: b.display_name as string,
    current_streak: b.current_streak as number,
    tier: b.tier as string,
  }));

  // ── 6. Open quests ────────────────────────────────────────────────────────
  const { data: rawQuests } = await supabase
    .from('quests')
    .select('id, title, category, reward_type')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(4);

  const openQuests = (rawQuests ?? []).map(q => ({
    id: q.id as string,
    title: q.title as string,
    category: q.category as string,
    reward_type: q.reward_type as string,
  }));

  // ── 7. Fetch subscriber emails ────────────────────────────────────────────
  // Builders who opted-in (email_digest = true in their settings or all builders with user accounts)
  const { data: subscribers } = await supabase
    .from('builders')
    .select('user_id, display_name')
    .not('user_id', 'is', null);

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ success: true, sent: 0, message: 'No subscribers' });
  }

  // Resolve emails via auth.users using service-role
  const userIds = subscribers.map(s => s.user_id as string);
  const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const emailMap = new Map<string, string>();
  for (const u of authUsers?.users ?? []) {
    if (u.email) emailMap.set(u.id, u.email);
  }

  const digestData = {
    weekNumber,
    year,
    topLogs,
    newBuilders,
    topStreaks,
    openQuests,
    totalLogs: totalLogs ?? 0,
    totalBuilders: totalBuilders ?? 0,
  };

  const html = buildDigestHtml(digestData);
  const text = buildDigestText(digestData);
  const subject = `Week ${weekNumber} Builder Digest — ${totalLogs ?? 0} logs shipped 🚀`;

  // ── 8. Send in batches of 50 (Resend batch limit) ────────────────────────
  const FROM = process.env.DIGEST_FROM_EMAIL ?? 'digest@opceo.ai';
  let sent = 0;
  let errors = 0;

  const emails = userIds
    .map(id => emailMap.get(id))
    .filter((e): e is string => !!e);

  // Send individually via BCC-safe approach — use batch send
  const BATCH_SIZE = 50;
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    const messages = batch.map(to => ({
      from: `OpCEO.AI <${FROM}>`,
      to,
      subject,
      html,
      text,
    }));

    try {
      await resend.batch.send(messages);
      sent += batch.length;
    } catch (err) {
      console.error('Resend batch error:', err);
      errors += batch.length;
    }
  }

  return NextResponse.json({
    success: true,
    weekNumber,
    year,
    totalLogs: totalLogs ?? 0,
    sent,
    errors,
  });
}
