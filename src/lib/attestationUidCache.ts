import { getAddress, type Address, type Hex } from "viem";
import { CERTIFICATE_DEMO_UID } from "@/constants/certificateDemo";

const STORAGE_KEY = "rootcamp:attestation-uids-v1";

type Store = Record<string, string[]>;

function storeKey(chainId: number, wallet: Address): string {
  return `${chainId}:${getAddress(wallet).toLowerCase()}`;
}

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Store;
  } catch {
    return {};
  }
}

function writeStore(store: Store): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota / private mode */
  }
}

const MAX_UIDS = 24;
const UID_RE = /^0x[a-fA-F0-9]{64}$/;

/** Attestation UIDs this browser has successfully resolved for the wallet (chain-scoped). */
export function listRememberedAttestationUids(
  chainId: number,
  wallet: Address | undefined | null,
): Hex[] {
  if (!wallet) return [];
  try {
    const w = getAddress(wallet);
    const key = storeKey(chainId, w);
    const store = readStore();
    const list = store[key];
    if (!Array.isArray(list)) return [];
    return list.filter((u): u is Hex => typeof u === "string" && UID_RE.test(u));
  } catch {
    return [];
  }
}

export function rememberAttestationUid(
  chainId: number,
  wallet: Address,
  uid: Hex,
): void {
  if (uid.toLowerCase() === CERTIFICATE_DEMO_UID.toLowerCase()) return;
  try {
    const w = getAddress(wallet);
    const u = uid.toLowerCase();
    const key = storeKey(chainId, w);
    const store = readStore();
    const prev = store[key] ?? [];
    const filtered = prev.filter((x) => x.toLowerCase() !== u);
    const next = [uid, ...filtered].slice(0, MAX_UIDS);
    store[key] = next;
    writeStore(store);
  } catch {
    /* ignore */
  }
}
