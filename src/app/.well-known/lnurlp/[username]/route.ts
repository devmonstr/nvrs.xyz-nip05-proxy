import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req: Request, { params }: { params: { username: string } }) {
  const { username } = params;

  if (!username) {
    return corsResponse({ reason: 'No username provided' }, 400);
  }

  const { data, error } = await supabase
    .from('registered_users')
    .select('lightning_address, public_key')
    .eq('username', username)
    .single();

  if (error || !data || !data.lightning_address) {
    return corsResponse({ reason: 'No lightning address found' }, 404);
  }

  const [lnName, lnDomain] = data.lightning_address.split('@');
  if (!lnName || !lnDomain) {
    return corsResponse({ reason: 'Invalid lightning address' }, 400);
  }

  return corsResponse({
    callback: `https://nvrs.xyz/.well-known/lnurlp/${username}/callback`,
    tag: 'payRequest',
    maxSendable: 100000000000,
    minSendable: 1000,
    metadata: JSON.stringify([
      ["text/plain", `Pay to ${username}@nvrs.xyz`],
      ["text/identifier", `${username}@nvrs.xyz`]
    ]),
    commentAllowed: 255,
    payerData: {
      name: { mandatory: false },
      email: { mandatory: false }
    },
    allowsNostr: true,
    nostrPubkey: data.public_key
  });
}

interface LnurlPayResponse {
  reason?: string;
  callback?: string;
  tag?: string;
  maxSendable?: number;
  minSendable?: number;
  metadata?: string;
  commentAllowed?: number;
  payerData?: {
    name?: { mandatory: boolean };
    email?: { mandatory: boolean };
  };
  allowsNostr?: boolean;
  nostrPubkey?: string;
}

function corsResponse(body: LnurlPayResponse, status: number = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

