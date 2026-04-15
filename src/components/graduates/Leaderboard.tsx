import { RefreshCw, Search, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Input } from "@/components/ui/input";
import Loader from "@/components/ui/loader";
import { InfoTip, TermTip } from "@/components/ui/tooltip";
import { CertificateModal } from "@/components/graduates/CertificateModal";
import { COPY } from "@/constants/publicCopy";
import { useGraduates } from "@/hooks/useGraduates";
import { unsupportedHallOfFameMessage } from "@/lib/chainMessages";
import {
  formatDecodedCompletionDate,
  safeExternalHref,
  truncateMiddle,
} from "@/lib/graduateDisplay";
import { cn, formatAddress } from "@/lib/utils";
import type { GraduateRecord } from "@/lib/types/graduate";

export function Leaderboard(): JSX.Element {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<GraduateRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { address, isConnected } = useAccount();

  const {
    graduates,
    myGraduates,
    totalGraduates,
    isLoading,
    isFetching,
    error,
    refetch,
    chainSupported,
    chainId,
    isSearchSchemaUid,
  } = useGraduates(search, address);

  const errorMessage = useMemo(() => {
    if (!chainSupported) {
      return unsupportedHallOfFameMessage(chainId);
    }
    if (!error) return null;
    const msg =
      error instanceof Error ? error.message : "Failed to load attestations.";
    if (
      msg.toLowerCase().includes("getlogs") ||
      msg.toLowerCase().includes("does not exist")
    ) {
      return `${msg} Your RPC may not expose eth_getLogs. Set VITE_ROOTSTOCK_TESTNET_RPC in .env to a provider that supports log queries.`;
    }
    return msg;
  }, [chainSupported, chainId, error]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-8">
      <header className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/90">
          {COPY.hero.eyebrow}
        </p>
        <h1 className="font-neueMachinaBold text-3xl text-white md:text-5xl">
          {COPY.hero.title}
        </h1>
        <p className="mx-auto mt-4 flex max-w-2xl flex-wrap items-center justify-center gap-x-1 gap-y-1 text-base leading-snug text-zinc-300 md:text-lg">
          <span>{COPY.hero.taglinePrefix}</span>
          <TermTip
            content={COPY.tooltips.credentialId}
            className="font-medium text-zinc-200"
          >
            Thinkific credential ID
          </TermTip>
          <span>{COPY.hero.taglineSuffix}</span>
        </p>

        <div
          className="mx-auto mt-5 max-w-2xl rounded-xl border border-amber-500/35 bg-amber-950/25 px-4 py-3 text-left text-sm text-amber-100/95 shadow-sm shadow-black/20"
          role="note"
        >
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-amber-200">
                {COPY.thinkific.hallCalloutTitle}
              </p>
              <p className="mt-1 leading-relaxed text-amber-100/85">
                {COPY.thinkific.hallCalloutBody}
              </p>
            </div>
            <InfoTip
              content={COPY.tooltips.hallDetail}
              label="Thinkific and this verifier"
              className="mt-0.5 shrink-0 border-amber-600/45 text-amber-200/85 hover:border-amber-400/55 hover:text-amber-50"
            />
          </div>
        </div>

        <div className="mx-auto mt-5 flex max-w-2xl flex-col items-center gap-2 text-center text-sm text-zinc-400 md:text-base">
          <p className="inline-flex flex-wrap items-center justify-center gap-x-1">
            <span>Public attestations via</span>
            <a
              className="text-amber-400 underline-offset-2 hover:underline"
              href={COPY.ras.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {COPY.ras.explorerLinkLabel}
            </a>
            <InfoTip
              content={COPY.tooltips.rasOverview}
              label="About Rootstock RAS"
              className="inline-flex align-middle"
            />
          </p>
          <p>
            <TermTip content={COPY.tooltips.walletAndSaved}>
              <span className="font-medium text-zinc-300">
                Connect wallet for My attestations
              </span>
            </TermTip>
          </p>
        </div>
      </header>

      {isConnected && address && chainSupported && (
        <section
          className="mb-8 rounded-xl border border-amber-500/25 bg-zinc-900/50 p-5"
          aria-labelledby="my-attestations-heading"
        >
          <div className="mb-3 flex items-center gap-2 text-amber-200/90">
            <Wallet className="h-5 w-5 shrink-0" aria-hidden />
            <h2
              id="my-attestations-heading"
              className="font-neueMachinaBold text-lg text-white"
            >
              My attestations
            </h2>
            <span className="ml-auto font-mono text-xs text-zinc-500">
              {formatAddress(address)}
            </span>
          </div>
          {isLoading ? (
            <p className="text-sm text-zinc-500">
              Loading attestations (chain and saved UIDs on this device)...
            </p>
          ) : myGraduates.length > 0 ? (
            <ul className="space-y-3">
              {myGraduates.map((g) => (
                <li
                  key={g.uid}
                  className="flex flex-col gap-2 rounded-lg border border-zinc-700/80 bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-zinc-100">
                      {g.decoded.participantName}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {g.decoded.courseName} · {g.decoded.credentialId} · Year{" "}
                      {formatDecodedCompletionDate(g.decoded.completionDate)}
                    </p>
                    {g.decoded.projectTitle.trim() ? (
                      <p className="text-xs text-zinc-600">
                        Capstone: {g.decoded.projectTitle}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-2 text-sm font-semibold text-black hover:from-orange-400 hover:to-amber-500"
                    onClick={() => {
                      setSelected(g);
                      setModalOpen(true);
                    }}
                  >
                    Open certificate
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-400">
              No Builder Rootcamp attestation loaded for this wallet as{" "}
              <strong className="text-zinc-300">recipient</strong> on chain{" "}
              {chainId}. For your{" "}
              <strong className="text-zinc-300">official certificate</strong>, open
              your <strong className="text-zinc-300">Thinkific</strong> dashboard.
              To verify on-chain, paste your{" "}
              <strong className="text-zinc-300">attestation UID</strong> from the{" "}
              <a
                className="text-amber-400 underline-offset-2 hover:underline"
                href="https://explorer.testnet.rootstock.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                RAS explorer
              </a>{" "}
              once. This browser can remember it. If the table is empty, check RPC
              settings or paste a full attestation UID.
            </p>
          )}
        </section>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="0x address, attestation UID, name, BR-C1-001, or capstone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-zinc-700 bg-zinc-900/80 pl-10 text-base text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-amber-500/40 md:text-sm"
            autoComplete="off"
            spellCheck={false}
            maxLength={256}
            aria-label="Search graduates"
          />
        </div>
        <button
          type="button"
          disabled={!chainSupported || isFetching}
          onClick={() => refetch()}
          className={cn(
            "inline-flex items-center justify-center rounded-lg border border-amber-600/40 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-950/40 disabled:pointer-events-none disabled:opacity-40",
          )}
        >
          <RefreshCw
            className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")}
          />
          Refresh
        </button>
      </div>

      <p className="mb-4 text-sm text-zinc-500">
        Showing {graduates.length}
        {search.trim() ? ` of ${totalGraduates}` : ""} graduate
        {totalGraduates === 1 ? "" : "s"}
        {chainSupported ? ` on chain ${chainId}` : ""}
      </p>

      {isSearchSchemaUid && (
        <div
          className="mb-6 rounded-lg border border-amber-600/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100"
          role="status"
        >
          You pasted the <strong>schema</strong> UID (one value shared by every
          Builder Rootcamp certificate). For <em>your</em> row, copy the{" "}
          <strong>attestation</strong> UID from the certificate URL in the
          explorer, for example{" "}
          <code className="break-all text-xs text-amber-200">
            .../ras/attestation/0xc945...
          </code>
          . Or search by wallet, name, or credential ID.
        </div>
      )}

      {errorMessage && (
        <div
          className="mb-6 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {chainSupported &&
        !isLoading &&
        !errorMessage &&
        totalGraduates === 0 &&
        !search.trim() && (
          <div
            className="mb-6 rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300"
            role="status"
          >
            No attestations were found via chain logs. Rootstock’s public HTTP
            node (<code className="text-zinc-400">public-node.testnet.rsk.co</code>)
            does not expose <code className="text-amber-200/90">eth_getLogs</code>{" "}
            (JSON-RPC -32601). Prefer{" "}
            <a
              className="text-amber-400 underline-offset-2 hover:underline"
              href="https://dev.rootstock.io/developers/rpc-api/rootstock/setup/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Rootstock RPC Service
            </a>{" "}
            via <code className="text-amber-200/90">VITE_ROOTSTOCK_TESTNET_RPC</code>{" "}
            in <code className="text-zinc-400">.env</code>, or dRPC fallbacks. You can always paste a
            full <strong className="text-zinc-200">attestation UID</strong> to
            load one certificate; your wallet will then show it under My
            attestations on return visits (saved in this browser).
          </div>
        )}

      {isLoading && chainSupported ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <Loader color="#f59e0b" secondaryColor="#451a03" />
          <p className="text-sm text-zinc-400">Loading attestations from chain...</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-amber-500/20 bg-zinc-950/60 shadow-lg shadow-black/40">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-amber-500/20 bg-zinc-900/90 text-xs uppercase tracking-wider text-amber-500/80">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Credential</th>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Capstone</th>
                  <th className="px-4 py-3 font-medium">Recipient</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {graduates.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-zinc-500"
                    >
                      No matching graduates. Try another address or UID.
                    </td>
                  </tr>
                ) : (
                  graduates.map((g) => {
                    const capstoneHref = safeExternalHref(g.decoded.projectURL);
                    return (
                    <tr
                      key={g.uid}
                      className="cursor-pointer transition-colors hover:bg-amber-950/20 focus-within:bg-amber-950/20"
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="w-full text-left font-medium text-zinc-100 hover:text-amber-400 focus:outline-none focus-visible:text-amber-400"
                          onClick={() => {
                            setSelected(g);
                            setModalOpen(true);
                          }}
                        >
                          {g.decoded.participantName}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-300">
                        <button
                          type="button"
                          className="text-left hover:text-amber-400 focus:outline-none focus-visible:text-amber-400"
                          onClick={() => {
                            setSelected(g);
                            setModalOpen(true);
                          }}
                        >
                          {g.decoded.credentialId}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        <button
                          type="button"
                          className="text-left hover:text-amber-400 focus:outline-none focus-visible:text-amber-400"
                          onClick={() => {
                            setSelected(g);
                            setModalOpen(true);
                          }}
                        >
                          {formatDecodedCompletionDate(g.decoded.completionDate)}
                        </button>
                      </td>
                      <td className="max-w-[200px] px-4 py-3 text-zinc-400">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            className="truncate text-left hover:text-amber-400 focus:outline-none focus-visible:text-amber-400"
                            title={
                              g.decoded.projectTitle.trim() || undefined
                            }
                            onClick={() => {
                              setSelected(g);
                              setModalOpen(true);
                            }}
                          >
                            {g.decoded.projectTitle.trim()
                              ? truncateMiddle(g.decoded.projectTitle.trim(), 36)
                              : "—"}
                          </button>
                          {capstoneHref ? (
                            <a
                              href={capstoneHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="truncate text-left font-mono text-[11px] text-amber-500/90 underline-offset-2 hover:underline"
                              title={capstoneHref}
                            >
                              {truncateMiddle(capstoneHref, 28)}
                            </a>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="font-mono text-xs text-zinc-400 hover:text-amber-400 focus:outline-none focus-visible:text-amber-400"
                          onClick={() => {
                            setSelected(g);
                            setModalOpen(true);
                          }}
                        >
                          {formatAddress(g.recipient)}
                        </button>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CertificateModal
        graduate={selected}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        chainId={chainId}
      />
    </div>
  );
}
