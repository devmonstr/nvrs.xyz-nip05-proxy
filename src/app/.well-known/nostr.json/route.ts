import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    if (!name) {
      // ไม่มี name query string
      return NextResponse.json({ names: {} });
    }
    // ดึง user จาก Supabase ตาม username
    const { data, error } = await supabase
      .from('registered_users')
      .select('public_key')
      .eq('username', name)
      .single();
    if (error || !data) {
      // ไม่พบ user
      return NextResponse.json({ names: {} });
    }
    const pubkey = data.public_key;
    // ดึง relay ของ user จาก user_relays
    const { data: relaysData } = await supabase
      .from('user_relays')
      .select('url')
      .eq('public_key', pubkey);
    const relaysArr = relaysData ? relaysData.map((r: { url: string }) => r.url) : [];
    // คืนค่า names และ relays ตาม NIP-05
    return NextResponse.json({
      names: { [name]: pubkey },
      relays: { [pubkey]: relaysArr }
    });
  } catch (error) {
    console.error('NIP-05 verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 