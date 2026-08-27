import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const since = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data } = await admin
    .from('presence')
    .select('*')
    .gte('last_seen', since)
    .order('last_seen', { ascending: false });

  return NextResponse.json({ sessions: data || [] });
}
