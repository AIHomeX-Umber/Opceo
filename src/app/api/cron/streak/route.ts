import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getISOWeek, getISOWeekYear, calculateTier } from '@/lib/score';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastWeekNum = getISOWeek(lastWeek);
  const lastWeekYear = getISOWeekYear(lastWeek);

  const { data: builders, error } = await supabase
    .from('builders')
    .select('id, current_streak, longest_streak');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalBuilders = builders?.length || 0;
  let processed = 0;

  for (const builder of builders || []) {
    const { data: logs } = await supabase
      .from('ship_logs')
      .select('id')
      .eq('builder_id', builder.id)
      .eq('week_number', lastWeekNum)
      .eq('year', lastWeekYear)
      .limit(1);

    const hasLog = (logs?.length || 0) > 0;
    const newStreak = hasLog ? builder.current_streak + 1 : 0;
    const newLongest = Math.max(newStreak, builder.longest_streak);
    const tier = calculateTier(newStreak, processed + 1, totalBuilders);

    await supabase
      .from('builders')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        tier,
        updated_at: new Date().toISOString(),
      })
      .eq('id', builder.id);

    processed++;
  }

  return NextResponse.json({ success: true, processed });
}
