import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Fetch users from your database
    // This is just an example response
    const names = {
      "yourname": "npub1...", // Replace with actual pubkey
    };

    return NextResponse.json({
      names,
      relays: {
        // Add your relay information here if needed
      }
    });
  } catch (error) {
    console.error('NIP-05 verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 