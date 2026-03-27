import { ArrowLeft, ExternalLink, FileDown, ImageDown, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { isDemoCertificate } from "@/constants/certificateDemo";
import { rasAttestationUrl } from "@/constants/eas";
import {
  CERTIFICATE_BACKGROUND_PATH,
  COPY,
} from "@/constants/publicCopy";
import {
  exportElementAsPdf,
  exportElementAsPng,
} from "@/lib/certificateExport";
import { cn, formatAddress } from "@/lib/utils";
import type { GraduateRecord } from "@/lib/types/graduate";

type Props = {
  graduate: GraduateRecord | null;
  open: boolean;
  onClose: () => void;
  chainId: number;
};

const DIPLOMA_TAGS: { label: string; className: string }[] = [
  { label: "NODES", className: "bg-lime-400 text-black" },
  { label: "DAOS", className: "bg-pink-400 text-black" },
  { label: "USDT0", className: "bg-cyan-400 text-black" },
  { label: "NFTS", className: "bg-zinc-100 text-black" },
  { label: "DEFI", className: "bg-green-400 text-black" },
  { label: "SOLIDITY", className: "bg-zinc-200 text-black" },
  { label: "EVM", className: "bg-violet-500 text-white" },
  { label: "BTCFI", className: "bg-amber-300 text-black" },
  { label: "WALLETS", className: "bg-pink-300 text-black" },
  { label: "BITCOIN L2", className: "bg-orange-500 text-black" },
];

function formatUnixDate(sec: bigint): string {
  if (sec <= 0n) return "N/A";
  try {
    return new Date(Number(sec) * 1000).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
}

type FallbackProps = {
  graduate: GraduateRecord;
  issued: string;
  expires: string;
};

function DiplomaFallbackLayout({
  graduate,
  issued,
  expires,
}: FallbackProps): JSX.Element {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black px-5 pb-8 pt-6 sm:px-10">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-amber-500 blur-3xl" />
        <div className="absolute -right-16 bottom-32 h-72 w-72 rounded-full bg-orange-600 blur-3xl" />
      </div>
      <div className="relative">
        <div className="mb-6 flex flex-wrap justify-center gap-2 sm:justify-between sm:gap-4">
          <div className="text-center sm:text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Issued
            </p>
            <p className="font-mono text-sm text-zinc-200">{issued}</p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Expires
            </p>
            <p className="font-mono text-sm text-zinc-200">{expires}</p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Credential ID
            </p>
            <p className="font-mono text-sm text-amber-200/90">
              {graduate.decoded.credentialId}
            </p>
          </div>
        </div>

        <div className="relative flex flex-col items-center text-center">
          <div className="absolute left-0 top-1/2 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
            {DIPLOMA_TAGS.slice(0, 5).map((t) => (
              <span
                key={t.label}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide",
                  t.className,
                )}
              >
                {t.label}
              </span>
            ))}
          </div>
          <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-2 lg:flex">
            {DIPLOMA_TAGS.slice(5).map((t) => (
              <span
                key={t.label}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide",
                  t.className,
                )}
              >
                {t.label}
              </span>
            ))}
          </div>

          <p
            id="cert-title"
            className="font-neueMachinaBold text-2xl text-white sm:text-4xl md:text-[2.75rem] md:leading-tight"
          >
            Certificate of Completion
          </p>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-500">
            This certificate is awarded to
          </p>
          <p className="mt-3 max-w-xl font-neueMachinaBold text-2xl text-zinc-300 sm:text-3xl md:text-4xl">
            {graduate.decoded.participantName}
          </p>
          <p className="mt-8 max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base">
            For the successful completion of the{" "}
            <strong className="font-medium text-zinc-200">
              Builder Rootcamp
            </strong>
            , an intensive program demonstrating practical skill in building
            decentralized applications on the{" "}
            <strong className="font-medium text-zinc-200">Rootstock</strong>{" "}
            network.
          </p>
          <p className="mt-6 text-lg font-medium text-amber-200/95 sm:text-xl">
            {graduate.decoded.courseName}
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Completion year{" "}
            <span className="font-mono text-zinc-300">
              {graduate.decoded.completionDate}
            </span>
            {" · "}
            <span
              className={
                graduate.decoded.isGraduated
                  ? "text-emerald-400/90"
                  : "text-amber-600"
              }
            >
              {graduate.decoded.isGraduated ? "Graduated" : "Not graduated"}
            </span>
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2 lg:hidden">
          {DIPLOMA_TAGS.map((t) => (
            <span
              key={t.label}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide",
                t.className,
              )}
            >
              {t.label}
            </span>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-md border-t border-white/15 pt-8 text-center">
          <p className="text-sm font-medium text-zinc-300">
            RootstockLabs DevEx Team
          </p>
          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <span className="inline-block h-2 w-2 rotate-45 bg-orange-500" />
            Rootstock <span className="text-zinc-600">|</span> Academy
          </p>
        </div>
      </div>
    </div>
  );
}

type OfficialLayerProps = {
  graduate: GraduateRecord;
  issued: string;
  expires: string;
  qrValue: string;
  onImageError: () => void;
};

function OfficialDiplomaLayer({
  graduate,
  issued,
  expires,
  qrValue,
  onImageError,
}: OfficialLayerProps): JSX.Element {
  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-lg border border-white/10 shadow-lg shadow-black/50">
      <img
        src={CERTIFICATE_BACKGROUND_PATH}
        alt=""
        width={1123}
        height={794}
        draggable={false}
        className="block h-auto w-full select-none"
        onError={onImageError}
      />
      <div className="absolute inset-0 flex flex-col items-center text-center">
        <div className="flex w-full justify-between px-[7%] pt-[4.5%] text-left text-[length:clamp(0.55rem,1.35vw,0.7rem)] leading-tight text-zinc-300">
          <div>
            <p className="font-semibold uppercase tracking-wider text-zinc-500">
              Issued
            </p>
            <p className="font-mono text-zinc-100">{issued}</p>
          </div>
          <div className="text-center">
            <p className="font-semibold uppercase tracking-wider text-zinc-500">
              Expires
            </p>
            <p className="font-mono text-zinc-100">{expires}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold uppercase tracking-wider text-zinc-500">
              Certificate ID
            </p>
            <p className="font-mono text-amber-200/95">
              {graduate.decoded.credentialId}
            </p>
          </div>
        </div>

        <p
          id="cert-title"
          className="sr-only"
        >
          Certificate of Completion for {graduate.decoded.participantName}
        </p>

        <p className="mt-[16%] max-w-[85%] font-neueMachinaBold text-[length:clamp(1.1rem,3.6vw,2.35rem)] leading-tight text-zinc-400">
          {graduate.decoded.participantName}
        </p>

        <p className="mt-[6%] max-w-[78%] text-[length:clamp(0.55rem,1.25vw,0.8rem)] leading-snug text-zinc-500">
          {graduate.decoded.courseName} · {graduate.decoded.completionDate}{" "}
          ·{" "}
          {graduate.decoded.isGraduated ? (
            <span className="text-emerald-400/90">Graduated</span>
          ) : (
            <span className="text-amber-600">Not graduated</span>
          )}
        </p>

        <div className="pointer-events-auto absolute bottom-[10%] right-[6%] rounded-md bg-white p-1.5 shadow-md shadow-black/40">
          <QRCode value={qrValue} size={72} level="M" />
        </div>
      </div>
    </div>
  );
}

export function CertificateModal({
  graduate,
  open,
  onClose,
  chainId,
}: Props): JSX.Element | null {
  const [artFailed, setArtFailed] = useState(false);
  const [exporting, setExporting] = useState<null | "png" | "pdf">(null);
  const diplomaCaptureRef = useRef<HTMLDivElement>(null);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onKeyDown]);

  useEffect(() => {
    if (open) setArtFailed(false);
  }, [open, graduate?.uid]);

  if (!open || !graduate) return null;

  const demo = isDemoCertificate(graduate);
  const explorerHref = rasAttestationUrl(chainId, graduate.uid);
  const qrValue = demo ? COPY.ras.explorerUrl : explorerHref;
  const issued = formatUnixDate(graduate.attestationTime);
  const expires =
    graduate.expirationTime === 0n
      ? "Never"
      : formatUnixDate(graduate.expirationTime);

  const copyUid = async () => {
    try {
      await navigator.clipboard.writeText(graduate.uid);
    } catch {
      /* ignore */
    }
  };

  const safeSlug = graduate.decoded.credentialId.replace(/[^\w.-]+/g, "_");
  const baseName = `rootcamp-${safeSlug}-ras`;

  const runExport = async (kind: "png" | "pdf") => {
    const el = diplomaCaptureRef.current;
    if (!el) return;
    setExporting(kind);
    try {
      if (kind === "png") {
        await exportElementAsPng(el, `${baseName}.png`);
      } else {
        await exportElementAsPdf(el, `${baseName}.pdf`);
      }
    } catch (e) {
      console.warn("[Rootcamp] certificate export failed", e);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close certificate"
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-[201] w-full max-w-4xl overflow-hidden rounded-2xl border border-amber-500/25 bg-zinc-950 shadow-2xl shadow-amber-950/40",
          "max-h-[min(94vh,920px)] overflow-y-auto",
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cert-title"
      >
        <div className="relative flex flex-wrap items-start justify-end gap-2 border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="mr-auto max-w-[min(100%,32rem)] space-y-2 text-left">
            {demo && (
              <p className="text-xs text-amber-200/90">
                Demo layout only, not a live attestation. Open a real row from the
                Hall of Fame to compare.
              </p>
            )}
            <div
              className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2.5 text-xs leading-relaxed text-amber-100/90"
              role="note"
            >
              {COPY.thinkific.modalNotice}
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-amber-400"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 px-4 py-6 sm:px-6">
          <div ref={diplomaCaptureRef} className="mx-auto w-full space-y-4">
            {!artFailed ? (
              <OfficialDiplomaLayer
                graduate={graduate}
                issued={issued}
                expires={expires}
                qrValue={qrValue}
                onImageError={() => setArtFailed(true)}
              />
            ) : (
              <>
                <DiplomaFallbackLayout
                  graduate={graduate}
                  issued={issued}
                  expires={expires}
                />
                <div className="flex justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 py-4 sm:justify-end sm:pr-4">
                  <div className="rounded-md bg-white p-2 shadow-md shadow-black/30">
                    <QRCode value={qrValue} size={88} level="M" />
                  </div>
                </div>
              </>
            )}
          </div>

          <details className="group rounded-xl border border-zinc-800 bg-zinc-950/80 open:border-amber-900/40">
            <summary className="cursor-pointer list-none px-4 py-3 text-center text-sm font-medium text-amber-200/80 transition-colors hover:text-amber-100 [&::-webkit-details-marker]:hidden">
              <span className="underline-offset-2 group-open:underline">
                On-chain verification and technical details
              </span>
            </summary>
            <div className="space-y-3 border-t border-zinc-800 px-4 py-4 text-left text-xs text-zinc-400">
              <p>
                <span className="text-zinc-500">Verification URL: </span>
                <a
                  href={explorerHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-mono text-amber-400/90 hover:underline"
                >
                  {explorerHref}
                </a>
              </p>
              <p>
                <span className="text-zinc-500">Attestation UID: </span>
                <span className="break-all font-mono text-zinc-300">
                  {graduate.uid}
                </span>
              </p>
              <p>
                <span className="text-zinc-500">Recipient: </span>
                <span className="break-all font-mono text-zinc-300">
                  {graduate.recipient}
                </span>
              </p>
              <p className="text-zinc-500">
                Short address: {formatAddress(graduate.recipient)}
              </p>
            </div>
          </details>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
            <button
              type="button"
              className="rounded-lg border border-amber-600/50 px-4 py-2.5 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-950/40"
              onClick={copyUid}
            >
              Copy UID
            </button>
            <button
              type="button"
              disabled={exporting !== null}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-600 bg-zinc-900/80 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800 disabled:opacity-40"
              onClick={() => void runExport("png")}
            >
              <ImageDown className="h-4 w-4" aria-hidden />
              {exporting === "png" ? "Saving…" : "Download PNG"}
            </button>
            <button
              type="button"
              disabled={exporting !== null}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-600 bg-zinc-900/80 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800 disabled:opacity-40"
              onClick={() => void runExport("pdf")}
            >
              <FileDown className="h-4 w-4" aria-hidden />
              {exporting === "pdf" ? "Saving…" : "Download PDF"}
            </button>
            {demo ? (
              <a
                href={COPY.ras.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-2.5 text-sm font-semibold text-black hover:from-orange-400 hover:to-amber-500"
              >
                About RAS verification
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            ) : (
              <a
                href={explorerHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-2.5 text-sm font-semibold text-black hover:from-orange-400 hover:to-amber-500"
              >
                View on Explorer
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            )}
          </div>
          <p className="text-center text-[11px] text-zinc-600">
            QR encodes the explorer verification link for sharing or print.
          </p>

          <div className="border-t border-zinc-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-600 bg-zinc-900/90 px-4 py-3 text-sm font-medium text-zinc-100 transition-colors hover:border-amber-500/40 hover:bg-zinc-800 sm:py-2.5"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              Back to Hall of Fame
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
