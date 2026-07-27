import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppHeader } from "../components/app-header";
import { Providers } from "../components/providers";
import "./styles.css";

export const metadata: Metadata = {
  title: "EGOG",
  description: "Verified Climate Participation",
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
