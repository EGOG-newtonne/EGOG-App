import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppHeader } from "../components/app-header";
import { Providers } from "../components/providers";
import "./styles.css";

export const metadata: Metadata = {
  title: "EGOG",
  description:
    "Explore verified carbon projects backed by dMRV data and join early before their DeFi pools go live.",
  metadataBase: new URL("https://egog.io"),
  openGraph: {
    description:
      "Explore verified carbon projects backed by dMRV data and join early before their DeFi pools go live.",
    siteName: "EGOG",
    title: "EGOG — Real-World Climate Assets",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary",
    description:
      "Explore verified carbon projects backed by dMRV data and join early before their DeFi pools go live.",
    title: "EGOG — Real-World Climate Assets",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
