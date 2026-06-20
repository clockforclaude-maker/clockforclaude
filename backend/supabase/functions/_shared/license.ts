// License-key helpers, shared across functions.
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// Unambiguous alphabet: no 0/O, 1/I to keep keys easy to read and re-type.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Generate a key like CFC-7K3M-9PQR-2WX4 using the crypto RNG. */
export function generateLicenseKey(): string {
  const groups: string[] = [];
  for (let g = 0; g < 3; g++) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    let group = "";
    for (const b of bytes) group += ALPHABET[b % ALPHABET.length];
    groups.push(group);
  }
  return `CFC-${groups.join("-")}`;
}

/** Normalize user input: uppercase, strip spaces, tolerate missing/extra dashes. */
export function normalizeLicenseKey(raw: string): string {
  const cleaned = (raw || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!cleaned.startsWith("CFC")) return cleaned; // let validation reject it
  const body = cleaned.slice(3);
  const groups = body.match(/.{1,4}/g) ?? [];
  return `CFC-${groups.join("-")}`;
}

export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
}
