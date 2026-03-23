import type { GraduateRecord } from "@/lib/types/graduate";
import type { Hex } from "viem";

/** Sentinel UID. Not a real attestation; opens the diploma layout preview only. */
export const CERTIFICATE_DEMO_UID =
  "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Hex;

export function isDemoCertificate(g: GraduateRecord): boolean {
  return g.uid.toLowerCase() === CERTIFICATE_DEMO_UID.toLowerCase();
}

/** Placeholder row for the Thinkific-style diploma preview (UI only). */
export const CERTIFICATE_DEMO_RECORD: GraduateRecord = {
  uid: CERTIFICATE_DEMO_UID,
  recipient: "0x0000000000000000000000000000000000000001",
  attester: "0xcbE094D2fE88C01D1097e8CE2D17ba9C623737eA3",
  attestationTime: BigInt(Math.floor(Date.now() / 1000) - 86_400),
  expirationTime: 0n,
  decoded: {
    participantName: "Jordan Builder",
    courseName: "Builder Rootcamp Cohort 1",
    completionDate: 2026,
    credentialId: "BR-000",
    isGraduated: true,
  },
};
