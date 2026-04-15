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
 * Must match on-chain schema text (RAS explorer “Raw Schema”).
 * @see https://explorer.testnet.rootstock.io/ras/schema/0xd042cfc03432b5c8d4a45027237f343803e1d9a77bf005d8fd353af2b3f4652a
 *
 * **Schema gaps vs Thinkific / marketing diploma:** the payload does not include
 * `certificateUrl`, `projectUrl`, `projectTitle`, or `projectDescription`. Those
 * would require registering a **new** EAS schema, migrating issuance, and
 * updating this app’s `RAS_SCHEMA_RAW` + decode logic. Short-term options:
 * derive a canonical “certificate URL” in the UI as the RAS explorer link
 * (`rasAttestationUrl`), or store rich metadata off-chain (IPFS) and add a
 * single `string metadataUri` field in a future schema revision.
 *
 * **Already on EAS (not in schema string):** `time` (issued) and
 * `expirationTime` (we surface these from `getAttestation`).
 */
export const RAS_SCHEMA_RAW =
  "string participantName, string courseName, uint16 completionDate, string credentialId, bool isGraduated";

/** EAS core on Rootstock Testnet. Used for `getAttestation` and log filters. */
export const EAS_CONTRACT_TESTNET: Address = RAS_TESTNET_ADDRESSES.eas;

export const SCHEMA_UID_TESTNET: Hex =
  "0xd042cfc03432b5c8d4a45027237f343803e1d9a77bf005d8fd353af2b3f4652a";

/**
 * Block where the sample schema was registered (tx registering schema on SchemaRegistry).
 * From: https://explorer.testnet.rootstock.io/ras/schema/0xd042cfc03432b5c8d4a45027237f343803e1d9a77bf005d8fd353af2b3f4652a
 */
export const START_BLOCK_TESTNET = 7_458_638n;

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
};

export const EAS_CHAIN_CONFIG: Record<number, EasChainConfig> = {
  31: {
    chainId: 31,
    easAddress: EAS_CONTRACT_TESTNET,
    schemaUid: SCHEMA_UID_TESTNET,
    startBlock: START_BLOCK_TESTNET,
    rasAttestationBaseUrl:
      "https://explorer.testnet.rootstock.io/ras/attestation",
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
 * Merge optional mainnet Hall of Fame config from env (e.g. Vercel).
 * Required: `VITE_SCHEMA_UID_MAINNET` + `VITE_EAS_START_BLOCK_MAINNET` (decimal block).
 * Find the schema UID and registration block on
 * [Rootstock mainnet RAS explorer](https://explorer.rootstock.io/ras/schemas).
 * EAS contract defaults to official RAS mainnet unless `VITE_EAS_CONTRACT_MAINNET` is set.
 */
function mergeMainnetFromEnv(): void {
  const easOverride = readOptionalAddressEnv(
    import.meta.env.VITE_EAS_CONTRACT_MAINNET,
  );
  const eas = easOverride ?? RAS_MAINNET_ADDRESSES.eas;
  const schema = readOptionalHexEnv(import.meta.env.VITE_SCHEMA_UID_MAINNET);
  const start = readOptionalBigIntEnv(
    import.meta.env.VITE_EAS_START_BLOCK_MAINNET,
  );
  const base =
    import.meta.env.VITE_RAS_ATTESTATION_BASE_MAINNET?.trim() ||
    "https://explorer.rootstock.io/ras/attestation";
  if (schema && start !== undefined) {
    EAS_CHAIN_CONFIG[30] = {
      chainId: 30,
      easAddress: eas,
      schemaUid: schema,
      startBlock: start,
      rasAttestationBaseUrl: base.replace(/\/$/, ""),
    };
  }
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
