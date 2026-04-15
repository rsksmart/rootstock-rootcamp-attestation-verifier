import { getAddress, getEventSelector, type Address, type Hex } from "viem";

/**
 * Canonical RAS contract addresses (Rootstock-deployed EAS stack).
 * @see https://dev.rootstock.io/dev-tools/attestations/ras/
 */
export const RAS_MAINNET_ADDRESSES = {
  /** On-chain EAS core (`getAttestation`, `Attested` events). */
  eas: getAddress("0x54c0726e9d2d57bc37ad52c7e219a3229e0ee963"),
  /** EIP712 proxy used by the explorer / indexer flows. */
  eip712Proxy: getAddress("0x4c0ac010c2ec50fc1ff3e7e35dada06a7f26073f"),
  schemaRegistry: getAddress("0xef29675d82cc5967069d6d9c17f2719f67728f5b"),
} as const;

export const RAS_TESTNET_ADDRESSES = {
  eas: getAddress("0xc300aeeadd60999933468738c9f5d7e9c0671e1c"),
  eip712Proxy: getAddress("0x4352e5b2567551986e21ed65d5ad3052a09e3717"),
  schemaRegistry: getAddress("0x679c62956cd2801ababf80e9d430f18859eea2d5"),
} as const;

/**
 * Wallet that signs official Builder Rootcamp graduate attestations.
 * Documented for verification support; compare to the `attester` field on each attestation.
 */
export const ROOTCAMP_OFFICIAL_ATTESTER = getAddress(
  "0x4ade69a62bc8cb24b005a34097ed8d8d650a4687",
);

/**
 * Must match on-chain schema text (RAS explorer “Raw Schema”) for each chain.
 *
 * **Already on EAS (not in schema string):** `time` (issued) and
 * `expirationTime` (we surface these from `getAttestation`).
 */
/** Legacy cohort (no capstone fields). Only used to decode old attestations if configured. */
export const RAS_SCHEMA_RAW_LEGACY =
  "string participantName, string courseName, uint16 completionDate, string credentialId, bool isGraduated";

/**
 * Current Builder Rootcamp graduate schema on Rootstock mainnet and testnet (same UID on both).
 * @see https://explorer.rootstock.io/ras/schema/0x4fbc7a0df4411f9369f05b8f4d5f716d5bdbeab7255ee1c867b2c6fe73a6fc58
 * @see https://explorer.testnet.rootstock.io/ras/schema/0x4fbc7a0df4411f9369f05b8f4d5f716d5bdbeab7255ee1c867b2c6fe73a6fc58
 */
export const RAS_SCHEMA_RAW_GRADUATE =
  "string participantName, string courseName, uint16 completionDate, string credentialId, bool isGraduated, string projectTitle, string projectURL";

/** Previous mainnet-only schema (uint256 completion). Kept for forks / custom env overrides. */
export const RAS_SCHEMA_RAW_MAINNET =
  "string participantName, string courseName, uint256 completionDate, string credentialId, bool isGraduated, string projectTitle, string projectURL";

/** EAS core on Rootstock Testnet. Used for `getAttestation` and log filters. */
export const EAS_CONTRACT_TESTNET: Address = RAS_TESTNET_ADDRESSES.eas;

/** Shared graduate schema UID (registered on chain 30 and 31). */
export const SCHEMA_UID_GRADUATE: Hex =
  "0x4fbc7a0df4411f9369f05b8f4d5f716d5bdbeab7255ee1c867b2c6fe73a6fc58";

export const SCHEMA_UID_TESTNET: Hex = SCHEMA_UID_GRADUATE;

/**
 * Block of schema registration on Rootstock Testnet.
 * @see https://explorer.testnet.rootstock.io/block/7548782
 */
export const START_BLOCK_TESTNET = 7_548_782n;

/**
 * Block of schema registration on Rootstock Mainnet.
 * @see https://explorer.rootstock.io/block/8728675
 */
export const START_BLOCK_MAINNET = 8_728_675n;

export const ATTESTED_EVENT_TOPIC0 = getEventSelector(
  "Attested(address,address,bytes32,bytes32)",
) as Hex;

/**
 * Max inclusive block span per `eth_getLogs` request.
 * Rootstock RPC Service allows at most a **2K block range** (or 10K logs); we stay
 * slightly under to avoid edge rejections.
 * @see https://dev.rootstock.io/developers/rpc-api/rootstock/
 */
export const LOG_CHUNK_BLOCKS = 1_999n;

/** Batch size for multicall getAttestation reads. */
export const ATTESTATION_MULTICALL_BATCH = 80;

export type EasChainConfig = {
  chainId: number;
  easAddress: Address;
  schemaUid: Hex;
  startBlock: bigint;
  rasAttestationBaseUrl: string;
  /** Must match the registered schema for `schemaUid` (used by ABI decoding). */
  schemaRaw: string;
};

export const EAS_CHAIN_CONFIG: Record<number, EasChainConfig> = {
  30: {
    chainId: 30,
    easAddress: RAS_MAINNET_ADDRESSES.eas,
    schemaUid: SCHEMA_UID_GRADUATE,
    startBlock: START_BLOCK_MAINNET,
    rasAttestationBaseUrl:
      "https://explorer.rootstock.io/ras/attestation",
    schemaRaw: RAS_SCHEMA_RAW_GRADUATE,
  },
  31: {
    chainId: 31,
    easAddress: EAS_CONTRACT_TESTNET,
    schemaUid: SCHEMA_UID_TESTNET,
    startBlock: START_BLOCK_TESTNET,
    rasAttestationBaseUrl:
      "https://explorer.testnet.rootstock.io/ras/attestation",
    schemaRaw: RAS_SCHEMA_RAW_GRADUATE,
  },
};

function readOptionalHexEnv(value: string | undefined): Hex | undefined {
  if (!value || !/^0x[a-fA-F0-9]+$/.test(value)) return undefined;
  return value as Hex;
}

function readOptionalAddressEnv(value: string | undefined): Address | undefined {
  const raw = value?.trim();
  if (!raw || !/^0x[a-fA-F0-9]{40}$/i.test(raw)) return undefined;
  try {
    return getAddress(raw as `0x${string}`);
  } catch {
    return undefined;
  }
}

function readOptionalBigIntEnv(value: string | undefined): bigint | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined;
  return BigInt(value);
}

/**
 * Optional mainnet overrides from env (e.g. Vercel). Defaults are built in for chain 30;
 * set `VITE_SCHEMA_UID_MAINNET` and/or `VITE_EAS_START_BLOCK_MAINNET` only if the on-chain
 * schema changes and you cannot redeploy immediately. If you override the schema UID, the
 * registered schema string must still match `schemaRaw` in config (or decoding will fail).
 */
function mergeMainnetFromEnv(): void {
  const cfg = EAS_CHAIN_CONFIG[30];
  if (!cfg) return;

  const easOverride = readOptionalAddressEnv(
    import.meta.env.VITE_EAS_CONTRACT_MAINNET,
  );
  const schema = readOptionalHexEnv(import.meta.env.VITE_SCHEMA_UID_MAINNET);
  const start = readOptionalBigIntEnv(
    import.meta.env.VITE_EAS_START_BLOCK_MAINNET,
  );
  const base =
    import.meta.env.VITE_RAS_ATTESTATION_BASE_MAINNET?.trim() ||
    cfg.rasAttestationBaseUrl;

  EAS_CHAIN_CONFIG[30] = {
    ...cfg,
    easAddress: easOverride ?? cfg.easAddress,
    schemaUid: schema ?? cfg.schemaUid,
    startBlock: start !== undefined ? start : cfg.startBlock,
    rasAttestationBaseUrl: base.replace(/\/$/, ""),
  };
}

mergeMainnetFromEnv();

export function getEasConfig(chainId: number): EasChainConfig | undefined {
  return EAS_CHAIN_CONFIG[chainId];
}

export function rasAttestationUrl(chainId: number, uid: Hex): string {
  const cfg = getEasConfig(chainId);
  const base =
    cfg?.rasAttestationBaseUrl ??
    (chainId === 31
      ? "https://explorer.testnet.rootstock.io/ras/attestation"
      : "https://explorer.rootstock.io/ras/attestation");
  return `${base.replace(/\/$/, "")}/${uid}`;
}
