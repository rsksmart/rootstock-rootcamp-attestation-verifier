import { ROOTCAMP_OFFICIAL_ATTESTER } from "@/constants/eas";
import { COPY } from "@/constants/publicCopy";

export default function Footer(): JSX.Element {
  return (
    <footer className="mx-auto mb-4 flex w-full max-w-[1200px] flex-col items-center gap-2 rounded-full px-5 py-3 text-center">
      <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
        {COPY.thinkific.footerBeforeThinkific}
        <strong className="font-medium text-zinc-400">Thinkific</strong>
        {COPY.thinkific.footerAfterThinkific}
      </p>
      <p className="max-w-2xl text-xs leading-relaxed text-zinc-500">
        {COPY.trust.officialAttesterIntro}
        <span className="break-all font-mono text-zinc-400">
          {ROOTCAMP_OFFICIAL_ATTESTER}
        </span>
        {COPY.trust.officialAttesterOutro}
      </p>
      <p className="text-sm text-white/80">
        Copyright © RootstockLabs {new Date().getFullYear()}. All rights
        reserved.
      </p>
    </footer>
  );
}
