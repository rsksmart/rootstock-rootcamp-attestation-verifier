import { useQueries, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { getAddress, isAddress, type Address, type Hex } from "viem";
import { useChainId } from "wagmi";
import { getEasConfig } from "@/constants/eas";
import {
  listRememberedAttestationUids,
  rememberAttestationUid,
} from "@/lib/attestationUidCache";
import { createEasPublicClient } from "@/lib/eas/easReadClient";
import {
  fetchGraduateByAttestationUid,
  fetchGraduates,
} from "@/lib/eas/fetchGraduates";
import { sanitizeSearchInput } from "@/lib/search";
import type { GraduateRecord } from "@/lib/types/graduate";

const BYTES32_UID_RE = /^0x[a-fA-F0-9]{64}$/;

function filterGraduates(
  list: GraduateRecord[],
  sanitized: string,
): GraduateRecord[] {
  if (!sanitized) return list;

  const q = sanitized.toLowerCase();

  if (BYTES32_UID_RE.test(sanitized)) {
    const uid = sanitized.toLowerCase();
    return list.filter((g) => g.uid.toLowerCase() === uid);
  }

  if (isAddress(sanitized)) {
    const addr = getAddress(sanitized);
    return list.filter((g) => getAddress(g.recipient) === addr);
  }

  return list.filter((g) => {
    const name = g.decoded.participantName.toLowerCase();
    const cred = g.decoded.credentialId.toLowerCase();
    return name.includes(q) || cred.includes(q);
  });
}

/**
 * @param connectedAddress When set (e.g. from `useAccount().address`), `myGraduates` lists
 * attestations whose on-chain recipient matches this wallet (auto “dashboard” for participants).
 */
export function useGraduates(
  searchRaw: string,
  connectedAddress?: Address | null,
) {
  const chainId = useChainId();
  const cfg = getEasConfig(chainId);
  const easClient = useMemo(() => createEasPublicClient(chainId), [chainId]);

  const savedUids = useMemo(
    () => listRememberedAttestationUids(chainId, connectedAddress ?? undefined),
    [chainId, connectedAddress],
  );

  const sanitizedQuery = useMemo(
    () => sanitizeSearchInput(searchRaw),
    [searchRaw],
  );

  const isSearchSchemaUid = Boolean(
    cfg &&
      BYTES32_UID_RE.test(sanitizedQuery) &&
      sanitizedQuery.toLowerCase() === cfg.schemaUid.toLowerCase(),
  );

  const uidLookupEnabled = Boolean(
    easClient &&
      cfg &&
      BYTES32_UID_RE.test(sanitizedQuery) &&
      !isSearchSchemaUid,
  );

  const uidForLookup = uidLookupEnabled
    ? (sanitizedQuery.toLowerCase() as Hex)
    : null;

  const listQuery = useQuery({
    queryKey: ["rootcamp-graduates", chainId],
    queryFn: async () => {
      if (!easClient || !cfg) {
        throw new Error("Missing EAS read client or configuration");
      }
      return fetchGraduates(easClient, cfg);
    },
    enabled: Boolean(easClient && cfg),
    staleTime: 60_000,
  });

  const uidQuery = useQuery({
    queryKey: ["rootcamp-graduate-uid", chainId, uidForLookup],
    queryFn: async () => {
      if (!easClient || !cfg || !uidForLookup) return null;
      return fetchGraduateByAttestationUid(easClient, cfg, uidForLookup);
    },
    enabled: uidLookupEnabled,
    staleTime: 60_000,
  });

  const cachedUidQueries = useQueries({
    queries: savedUids.map((uid) => ({
      queryKey: ["rootcamp-cached-uid", chainId, uid],
      queryFn: async () => {
        if (!easClient || !cfg) return null;
        return fetchGraduateByAttestationUid(easClient, cfg, uid);
      },
      enabled: Boolean(easClient && cfg && savedUids.length > 0),
      staleTime: 60_000,
    })),
  });

  const cachedGraduateRows = useMemo((): GraduateRecord[] => {
    const out: GraduateRecord[] = [];
    for (const q of cachedUidQueries) {
      if (q.data) out.push(q.data);
    }
    return out;
  }, [cachedUidQueries]);

  const baseGraduates = useMemo(() => {
    const fromLogs = listQuery.data ?? [];
    const seen = new Set(fromLogs.map((g) => g.uid.toLowerCase()));
    const merged: GraduateRecord[] = [...fromLogs];

    const add = (g: GraduateRecord | null | undefined) => {
      if (!g) return;
      const k = g.uid.toLowerCase();
      if (seen.has(k)) return;
      seen.add(k);
      merged.push(g);
    };

    if (uidLookupEnabled) add(uidQuery.data ?? null);
    for (const g of cachedGraduateRows) add(g);

    return merged;
  }, [
    listQuery.data,
    uidQuery.data,
    uidLookupEnabled,
    cachedGraduateRows,
  ]);

  const graduates = useMemo(
    () => filterGraduates(baseGraduates, sanitizedQuery),
    [baseGraduates, sanitizedQuery],
  );

  const myGraduates = useMemo(() => {
    if (!connectedAddress) return [];
    try {
      const addr = getAddress(connectedAddress);
      return baseGraduates.filter((g) => getAddress(g.recipient) === addr);
    } catch {
      return [];
    }
  }, [baseGraduates, connectedAddress]);

  useEffect(() => {
    if (!connectedAddress || !cfg) return;
    try {
      const w = getAddress(connectedAddress);
      const row = uidLookupEnabled ? uidQuery.data : undefined;
      if (row && getAddress(row.recipient) === w) {
        rememberAttestationUid(chainId, w, row.uid);
      }
    } catch {
      /* invalid address */
    }
  }, [connectedAddress, cfg, chainId, uidLookupEnabled, uidQuery.data]);

  useEffect(() => {
    if (!connectedAddress || !listQuery.data?.length || !cfg) return;
    try {
      const w = getAddress(connectedAddress);
      for (const g of listQuery.data) {
        if (getAddress(g.recipient) === w) {
          rememberAttestationUid(chainId, w, g.uid);
        }
      }
    } catch {
      /* ignore */
    }
  }, [listQuery.data, connectedAddress, chainId, cfg]);

  const isLoading =
    listQuery.isLoading ||
    (uidLookupEnabled && uidQuery.isLoading) ||
    (savedUids.length > 0 &&
      cachedUidQueries.some((q) => q.isLoading));

  const isFetching =
    listQuery.isFetching ||
    uidQuery.isFetching ||
    cachedUidQueries.some((q) => q.isFetching);

  const cachedError = cachedUidQueries.find((q) => q.error)?.error;

  return {
    graduates,
    myGraduates,
    totalGraduates: baseGraduates.length,
    isLoading,
    isFetching,
    error: listQuery.error ?? uidQuery.error ?? cachedError,
    refetch: () => {
      void listQuery.refetch();
      void uidQuery.refetch();
      for (const q of cachedUidQueries) void q.refetch();
    },
    chainSupported: Boolean(cfg),
    chainId,
    isSearchSchemaUid,
  };
}
