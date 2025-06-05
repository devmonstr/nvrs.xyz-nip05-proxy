import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  const { username } = params;
  if (!username) {
    return NextResponse.json({ status: 'ERROR', reason: 'No username provided' }, { status: 400, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }});
  }
  // ดึง lightning_address จากฐานข้อมูล
  const { data, error } = await supabase
    .from('registered_users')
    .select('lightning_address')
    .eq('username', username)
    .single();
  if (error || !data || !data.lightning_address) {
    return NextResponse.json({ status: 'ERROR', reason: 'No lightning address found' }, { status: 404, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }});
  }
  const [lnName, lnDomain] = data.lightning_address.split('@');
  if (!lnName || !lnDomain) {
    return NextResponse.json({ status: 'ERROR', reason: 'Invalid lightning address' }, { status: 400, headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }});
  }
  // สร้าง LNURL-pay metadata (proxy ไปยัง LN address จริง)
  return NextResponse.json({
    status: 'OK',
    callback: `https://${lnDomain}/.well-known/lnurlp/${lnName}`,
    tag: 'payRequest',
    maxSendable: 100000000, // 1,000,000 sats
    minSendable: 1000,      // 1 sat
    metadata: JSON.stringify([
      ["text/plain", `Pay to ${username}@nvrs.xyz (proxy to ${data.lightning_address})`]
    ]),
    commentAllowed: 120,
    payerData: {
      name: { mandatory: false },
      email: { mandatory: false }
    }
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
} 