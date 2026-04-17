import {
  decodeAbiParameters,
  decodeEventLog,
  parseAbi,
  parseAbiParameters,
  type Hex,
  type Log,
  type PublicClient,
} from "viem";
import {
  ATTESTATION_MULTICALL_BATCH,
  ATTESTED_EVENT_TOPIC0,
  LOG_CHUNK_BLOCKS,
  RAS_SCHEMA_RAW_GRADUATE,
  RAS_SCHEMA_RAW_LEGACY,
  RAS_SCHEMA_RAW_MAINNET,
  type EasChainConfig,
} from "@/constants/eas";
import type {
  DecodedAttestationFields,
  GraduateRecord,
} from "@/lib/types/graduate";

const easAbi = parseAbi([
  /** Wrapped tuple: Rootstock EAS returns a struct with dynamic `bytes data`, so ABI encoding begins with a head offset. */
  "function getAttestation(bytes32 uid) view returns ((bytes32 uid, bytes32 schema, uint64 time, uint64 expirationTime, uint64 revocationTime, bytes32 refUID, address recipient, address attester, bool revocable, bytes data))",
  "event Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schema)",
]);

const SCHEMA_PARAMS_LEGACY = parseAbiParameters(
  "string participantName, string courseName, uint16 completionDate, string credentialId, bool isGraduated",
);
const SCHEMA_PARAMS_GRADUATE = parseAbiParameters(
  "string participantName, string courseName, uint16 completionDate, string credentialId, bool isGraduated, string projectTitle, string projectURL",
);
const SCHEMA_PARAMS_MAINNET = parseAbiParameters(
  "string participantName, string courseName, uint256 completionDate, string credentialId, bool isGraduated, string projectTitle, string projectURL",
);

function toCompletionBig(v: unknown): bigint | null {
  if (typeof v === "bigint") return v;
  if (typeof v === "number" && Number.isFinite(v)) return BigInt(Math.trunc(v));
  return null;
}

function toDecodedFields(
  data: Hex,
  cfg: EasChainConfig,
): DecodedAttestationFields | null {
  try {
    if (cfg.schemaRaw === RAS_SCHEMA_RAW_LEGACY) {
      const decoded = decodeAbiParameters(SCHEMA_PARAMS_LEGACY, data);
      const [participantName, courseName, completionDate, credentialId, isGraduated] =
        decoded;
      const completionBig = toCompletionBig(completionDate);
      if (completionBig === null) return null;
      if (completionBig < 0n || completionBig > 65535n) {
        return null;
      }
      return {
        participantName,
        courseName,
        completionDate: completionBig,
        credentialId,
        isGraduated,
        projectTitle: "",
        projectURL: "",
      };
    }

    if (cfg.schemaRaw === RAS_SCHEMA_RAW_GRADUATE) {
      const decoded = decodeAbiParameters(SCHEMA_PARAMS_GRADUATE, data);
      const [
        participantName,
        courseName,
        completionDate,
        credentialId,
        isGraduated,
        projectTitle,
        projectURL,
      ] = decoded;
      const completionBig = toCompletionBig(completionDate);
      if (completionBig === null) return null;
      if (completionBig < 0n || completionBig > 65535n) {
        return null;
      }
      return {
        participantName,
        courseName,
        completionDate: completionBig,
        credentialId,
        isGraduated,
        projectTitle,
        projectURL,
      };
    }

    if (cfg.schemaRaw !== RAS_SCHEMA_RAW_MAINNET) {
      return null;
    }
    const decoded = decodeAbiParameters(SCHEMA_PARAMS_MAINNET, data);
    const [
      participantName,
      courseName,
      completionDate,
      credentialId,
      isGraduated,
      projectTitle,
      projectURL,
    ] = decoded;
    const completionBig = toCompletionBig(completionDate);
    if (completionBig === null || completionBig < 0n) return null;

    return {
      participantName,
      courseName,
      completionDate: completionBig,
      credentialId,
      isGraduated,
      projectTitle,
      projectURL,
    };
  } catch {
    return null;
  }
}

const ZERO_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as Hex;

function toBigIntLoose(v: unknown): bigint {
  if (typeof v === "bigint") return v;
  if (typeof v === "number" && Number.isFinite(v)) return BigInt(Math.trunc(v));
  if (typeof v === "string" && v !== "") return BigInt(v);
  return 0n;
}

type AttestationTuple = {
  uid: Hex;
  schema: Hex;
  time: bigint;
  expirationTime: bigint;
  revocationTime: bigint;
  recipient: Hex;
  attester: Hex;
  data: Hex;
};

/**
 * Viem `readContract` / `multicall` return `getAttestation` as a named object, not a positional array.
 */
function normalizeGetAttestationOutput(raw: unknown): AttestationTuple | null {
  if (Array.isArray(raw) && raw.length === 1) {
    return normalizeGetAttestationOutput(raw[0]);
  }

  if (Array.isArray(raw) && raw.length >= 10) {
    return {
      uid: raw[0] as Hex,
      schema: raw[1] as Hex,
      time: toBigIntLoose(raw[2]),
      expirationTime: toBigIntLoose(raw[3]),
      revocationTime: toBigIntLoose(raw[4]),
      recipient: raw[6] as Hex,
      attester: raw[7] as Hex,
      data: raw[9] as Hex,
    };
  }

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    const nested = o.attestation;
    if (nested && typeof nested === "object") {
      return normalizeGetAttestationOutput(nested);
    }
    const uid = o.uid;
    const schema = o.schema;
    const data = o.data;
    const recipient = o.recipient;
    const attester = o.attester;
    if (
      typeof uid === "string" &&
      typeof schema === "string" &&
      typeof data === "string" &&
      typeof recipient === "string" &&
      typeof attester === "string"
    ) {
      return {
        uid: uid as Hex,
        schema: schema as Hex,
        time: toBigIntLoose(o.time),
        expirationTime: toBigIntLoose(o.expirationTime),
        revocationTime: toBigIntLoose(o.revocationTime),
        recipient: recipient as Hex,
        attester: attester as Hex,
        data: data as Hex,
      };
    }
  }

  return null;
}

/** Map getAttestation return value to a graduate row, or null if missing/revoked/wrong schema. */
export function parseGetAttestationResult(
  uid: Hex,
  raw: unknown,
  cfg: EasChainConfig,
): GraduateRecord | null {
  const t = normalizeGetAttestationOutput(raw);
  if (!t) return null;

  if (
    !t.uid ||
    t.uid.toLowerCase() === ZERO_BYTES32.toLowerCase() ||
    t.uid.toLowerCase() !== uid.toLowerCase()
  ) {
    return null;
  }

  if (t.schema.toLowerCase() !== cfg.schemaUid.toLowerCase()) return null;
  if (t.revocationTime !== 0n) return null;

  const decoded = toDecodedFields(t.data, cfg);
  if (!decoded) return null;

  return {
    uid,
    recipient: t.recipient,
    attester: t.attester,
    attestationTime: t.time,
    expirationTime: t.expirationTime,
    decoded,
  };
}

/** Load one certificate by attestation UID (works even when eth_getLogs is unavailable). */
export async function fetchGraduateByAttestationUid(
  client: PublicClient,
  cfg: EasChainConfig,
  uid: Hex,
): Promise<GraduateRecord | null> {
  const raw = await client.readContract({
    address: cfg.easAddress,
    abi: easAbi,
    functionName: "getAttestation",
    args: [uid],
  });
  return parseGetAttestationResult(uid, raw, cfg);
}

function parseAttestedLog(log: Log): Hex | null {
  try {
    const decoded = decodeEventLog({
      abi: easAbi,
      data: log.data,
      topics: log.topics,
      eventName: "Attested",
    });
    return decoded.args.uid as Hex;
  } catch {
    return null;
  }
}

async function getLogsChunked(
  client: PublicClient,
  cfg: EasChainConfig,
  fromBlock: bigint,
  toBlock: bigint,
): Promise<Log[]> {
  const filter = {
    address: cfg.easAddress,
    topics: [
      ATTESTED_EVENT_TOPIC0,
      null,
      null,
      cfg.schemaUid,
    ] as const,
  };

  const out: Log[] = [];
  let start = fromBlock;

  while (start <= toBlock) {
    const end =
      start + LOG_CHUNK_BLOCKS - 1n > toBlock
        ? toBlock
        : start + LOG_CHUNK_BLOCKS - 1n;
    const chunk = await client.getLogs({
      ...filter,
      fromBlock: start,
      toBlock: end,
    });
    out.push(...chunk);
    start = end + 1n;
  }

  return out;
}

export async function fetchGraduates(
  client: PublicClient,
  cfg: EasChainConfig,
): Promise<GraduateRecord[]> {
  const latest = await client.getBlockNumber();

  const fromBlock =
    cfg.startBlock > latest ? latest : cfg.startBlock;

  let logs: Log[] = [];
  try {
    logs = await getLogsChunked(client, cfg, fromBlock, latest);
  } catch (err) {
    console.warn(
      "[Rootcamp] eth_getLogs failed; Hall of Fame list will be empty unless users paste an attestation UID. Rootstock public-node URLs often return JSON-RPC -32601 for eth_getLogs. Set VITE_ROOTSTOCK_TESTNET_RPC or rely on the app dRPC fallback.",
      err,
    );
    logs = [];
  }

  const uidSet = new Set<Hex>();
  for (const log of logs) {
    const uid = parseAttestedLog(log);
    if (uid) uidSet.add(uid);
  }

  const uids = [...uidSet];
  const records: GraduateRecord[] = [];

  for (let i = 0; i < uids.length; i += ATTESTATION_MULTICALL_BATCH) {
    const slice = uids.slice(i, i + ATTESTATION_MULTICALL_BATCH);
    const results = await client.multicall({
      allowFailure: true,
      contracts: slice.map((uid) => ({
        address: cfg.easAddress,
        abi: easAbi,
        functionName: "getAttestation",
        args: [uid],
      })),
    });

    for (let j = 0; j < slice.length; j++) {
      const uid = slice[j];
      const res = results[j];
      if (res.status !== "success") continue;

      const row = parseGetAttestationResult(uid, res.result, cfg);
      if (row) records.push(row);
    }
  }

  records.sort((a, b) => {
    if (a.attestationTime === b.attestationTime) return 0;
    return a.attestationTime < b.attestationTime ? 1 : -1;
  });

  return records;
}
