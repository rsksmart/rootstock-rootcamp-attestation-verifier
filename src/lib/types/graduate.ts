import type { Hex } from "viem";

/** Strict shape of Builder Rootcamp certificate fields after EAS schema decode. */
export interface DecodedAttestationFields {
  participantName: string;
  courseName: string;
  completionDate: number;
  credentialId: string;
  isGraduated: boolean;
}

/** One graduate row for the Hall of Fame + certificate modal. */
export interface GraduateRecord {
  uid: Hex;
  recipient: Hex;
  attester: Hex;
  /** Unix seconds when attestation was created (EAS `time`). */
  attestationTime: bigint;
  /** Unix seconds; `0n` means no expiry (EAS `NO_EXPIRATION_TIME`). */
  expirationTime: bigint;
  decoded: DecodedAttestationFields;
}
