import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

/** Allow only https origins (no path) for injected OG meta at build time. */
function safePublicSiteUrl(raw: string | undefined): string {
  const u = raw?.trim().replace(/\/$/, "") ?? "";
  if (!u) return "";
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== "https:") return "";
    return parsed.origin === u ? u : "";
  } catch {
    return "";
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "html-public-site-meta",
      transformIndexHtml(html) {
        const base = safePublicSiteUrl(process.env.VITE_SITE_URL);
        const ogImage = base
          ? `${base}/BuilderRootcampCert.png`
          : "/BuilderRootcampCert.png";
        const ogUrlMeta = base
          ? `<meta property="og:url" content="${base}/" />`
          : "";
        const canonical = base
          ? `<link rel="canonical" href="${base}/" />`
          : "";
        return html
          .replace(/__OG_IMAGE__/g, ogImage)
          .replace("__OG_URL_META__", ogUrlMeta)
          .replace("__CANONICAL_LINK__", canonical);
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [NodeGlobalsPolyfillPlugin({ process: true, buffer: true })],
    },
  },
});
