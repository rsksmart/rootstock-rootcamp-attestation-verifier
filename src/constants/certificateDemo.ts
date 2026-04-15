import type { GraduateRecord } from "@/lib/types/graduate";
import type { Hex } from "viem";

/** Sentinel UID (legacy preview). `isDemoCertificate` stays for any stale client state. */
export const CERTIFICATE_DEMO_UID =
  "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Hex;

export function isDemoCertificate(g: GraduateRecord): boolean {
  return g.uid.toLowerCase() === CERTIFICATE_DEMO_UID.toLowerCase();
}
