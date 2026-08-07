import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Relay — free-key AI router",
  description: "Bring your own free API keys or a KodeKey, and Relay ranks, calls, and falls back across models automatically.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Fonts are plain system-font stacks (see tailwind.config.ts) rather than
          next/font/google — that fetches from Google Fonts at build time, which
          fails the whole CSS pipeline in offline/restricted environments. */}
      <body className="font-body bg-base-950 text-base-200 antialiased">
        {children}
      </body>
    </html>
  );
}
