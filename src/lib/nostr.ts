// Utility for fetching Nostr profile metadata (kind 0) from a relay. Used throughout the app for user and community profile display.

export interface NostrProfileMetadata {
  name?: string;
  about?: string;
  picture?: string;
  nip05?: string;
  banner?: string;
  lud16?: string; // lightning address
}

const POPULAR_RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.primal.net",
  "wss://relay.notoshi.win",
  "wss://nos.lol",
  "wss://relay.nostr.band",
  "wss://nostr.mom",
  "wss://purplepag.es",
  "wss://nostr.wine",
  "wss://offchain.pub",
  "wss://eden.nostr.land",
  "wss://nostr-pub.wellorder.net",
  "wss://nostr1.tunnelsats.com",
  "wss://yabu.me",
  "wss://nostream.ocha.one",
  "wss://nrelay-jp.c-stellar.net",
  "wss://nrelay.c-stellar.net",
  "wss://r.kojira.io",
  "wss://relay-jp.nostr.wirednet.jp",
  "wss://relay-jp.shino3.net",
  "wss://relay.nostr.wirednet.jp",
];

function fetchFromRelay(pubkey: string, relay: string): Promise<NostrProfileMetadata | null> {
  return new Promise((resolve) => {
    try {
      const ws = new window.WebSocket(relay);
      let resolved = false;
      ws.onopen = () => {
        ws.send(
          JSON.stringify([
            "REQ",
            "profile-meta-0",
            { kinds: [0], authors: [pubkey] },
          ])
        );
      };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg[0] === "EVENT" && msg[2]?.kind === 0 && msg[2]?.content) {
            resolved = true;
            resolve(JSON.parse(msg[2].content));
            ws.close();
          }
        } catch {}
      };
      ws.onerror = () => {
        if (!resolved) resolve(null);
        ws.close();
      };
      ws.onclose = () => {
        if (!resolved) resolve(null);
      };
      setTimeout(() => {
        if (!resolved) {
          resolve(null);
          ws.close();
        }
      }, 3500);
    } catch {
      resolve(null);
    }
  });
}

export async function fetchNostrProfile(pubkey: string): Promise<NostrProfileMetadata | null> {
  if (typeof window === "undefined") return null;
  const results = await Promise.all(POPULAR_RELAYS.map((relay) => fetchFromRelay(pubkey, relay)));
  const profiles = results.filter(Boolean) as NostrProfileMetadata[];
  if (profiles.length === 0) return null;
  // Merge: use the first non-empty value for each field
  const merged: NostrProfileMetadata = {};
  const fields: (keyof NostrProfileMetadata)[] = ["name", "about", "picture", "nip05", "banner", "lud16"];
  for (const field of fields) {
    merged[field] = profiles.find((p) => p[field])?.[field];
  }
  return merged;
} 