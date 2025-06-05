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
      // No name query string
      return NextResponse.json({ names: {} });
    }
    // Fetch user from Supabase by username
    const { data, error } = await supabase
      .from('registered_users')
      .select('id, public_key')
      .eq('username', name)
      .single();
    if (error || !data) {
      // User not found
      return NextResponse.json({ names: {} });
    }
    const pubkey = data.public_key;
    const userId = data.id;
    // Fetch user's relays from user_relays (by user_id)
    const { data: relaysData } = await supabase
      .from('user_relays')
      .select('url')
      .eq('user_id', userId);
    const relaysArr = relaysData ? relaysData.map((r: { url: string }) => r.url) : [];
    // Return names and relays according to NIP-05
    return NextResponse.json({
      names: { [name]: pubkey },
      relays: { [pubkey]: relaysArr }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (error) {
    console.error('NIP-05 verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }}
    );
  }
} 