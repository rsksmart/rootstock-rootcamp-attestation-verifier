/**
 * Central user-facing strings and static asset paths.
 * Longer explanations live in `tooltips` and show in UI hints.
 */

export const CERTIFICATE_BACKGROUND_PATH = "/BuilderRootcampCert.png" as const;

export const COPY = {
  hero: {
    eyebrow: "BUILDER ROOTCAMP",
    title: "Graduate attestation verifier",
    taglinePrefix:
      "Search the public list. Open a verifiable proof. Your ",
    taglineSuffix: " is what we check on chain.",
  },
  /** Shown in InfoTip / TermTip on the leaderboard hero. */
  tooltips: {
    credentialId:
      "Same value as in Thinkific (e.g. BR-001). It is stored in the public attestation on Rootstock.",
    hallDetail:
      "Official PDF and student record: Thinkific dashboard only. This site reads public RAS (EAS) attestations on Rootstock so you can match ID, UID, or wallet.",
    rasOverview:
      "Rootstock Attestation Service: Ethereum Attestation Service on Rootstock. These records are public; anyone can verify them.",
    walletAndSaved:
      "Use the wallet that received the attestation. After you open a row once, this browser can remember its UID in localStorage for My attestations.",
  },
  thinkific: {
    modalNotice:
      "Official PDF: Thinkific. Below is public on-chain data. Your credential ID should match Thinkific.",
    hallCalloutTitle: "Official certificate: Thinkific",
    hallCalloutBody:
      "PDF lives in Thinkific. Verify the same record here with search (ID, UID, or wallet).",
    footerBeforeThinkific: "Official course certificates are issued in ",
    footerAfterThinkific:
      ". This site only helps you verify public attestations on Rootstock RAS.",
  },
  ras: {
    explorerLinkLabel: "Rootstock RAS",
    /** Public RAS explorer (Hall of Fame "Public attestations via …" link). */
    explorerUrl: "https://explorer.rootstock.io/ras",
    /** Developer docs for RAS / EAS integration. */
    docsUrl: "https://dev.rootstock.io/dev-tools/attestations/ras/",
  },
  /** Shown next to the official attester line in the footer (address is injected from code). */
  trust: {
    officialAttesterIntro:
      "Official Builder Rootcamp attestations are signed on-chain by ",
    officialAttesterOutro:
      ". Compare this address to the attester shown in a certificate’s technical details.",
  },
} as const;
