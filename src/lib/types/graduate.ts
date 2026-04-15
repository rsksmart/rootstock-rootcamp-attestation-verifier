import type { Hex } from "viem";

/** Strict shape of Builder Rootcamp certificate fields after EAS schema decode. */
export interface DecodedAttestationFields {
  participantName: string;
  courseName: string;
  /** Current schema: uint16 (e.g. year-style code). Legacy uint256 Unix timestamps possible if using old mainnet schema. */
  completionDate: bigint;
  credentialId: string;
  isGraduated: boolean;
  /** Mainnet schema; empty strings on legacy attestations. */
  projectTitle: string;
  projectURL: string;
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
