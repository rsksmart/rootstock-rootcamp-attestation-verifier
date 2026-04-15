import Logo from "@/components/ui/logo";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";

export default function Navbar(): JSX.Element {
  return (
    <nav
      className="sticky top-4 z-[100] mx-auto mt-4 flex w-full max-w-[1200px] items-center justify-between gap-4 rounded-full border border-amber-500/10 bg-zinc-900/40 px-5 py-3 backdrop-blur-lg"
      aria-label="Primary"
    >
      <Link
        to="/"
        className="flex min-w-0 items-center gap-3"
        aria-label="Rootcamp attestation verifier home"
      >
        <Logo className="h-10 w-[120px] shrink-0" />
        <span className="hidden font-neueMachinaBold text-sm text-amber-100/90 sm:inline truncate">
          Attestation verifier
        </span>
      </Link>
      <ConnectButton
        showBalance={false}
        chainStatus={{ smallScreen: "none", largeScreen: "icon" }}
      />
    </nav>
  );
}
